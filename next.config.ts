// @ts-nocheck
import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// 修复 Windows RaiDrive / 虚拟网络驱动器上 fs.readlink 返回 EISDIR 替代 EINVAL 导致 Webpack 崩溃的问题
function patchFsReadlink() {
  const origReadlink = fs.readlink;
  const origReadlinkSync = fs.readlinkSync;
  const origPromisesReadlink = fs.promises?.readlink;

  fs.readlink = function (...args: any[]) {
    const cb = typeof args[args.length - 1] === "function" ? args.pop() : null;
    if (cb) {
      return (origReadlink as any).call(fs, ...args, (err: any, linkString: any) => {
        if (err && err.code === "EISDIR") {
          const newErr: any = new Error(`EINVAL: invalid argument, readlink '${args[0]}'`);
          newErr.code = "EINVAL";
          newErr.errno = -4071;
          newErr.syscall = "readlink";
          return cb(newErr);
        }
        return cb(err, linkString);
      });
    }
    return (origReadlink as any).apply(fs, args);
  };

  fs.readlinkSync = function (...args: any[]) {
    try {
      return (origReadlinkSync as any).apply(fs, args);
    } catch (err: any) {
      if (err && err.code === "EISDIR") {
        const newErr: any = new Error(`EINVAL: invalid argument, readlink '${args[0]}'`);
        newErr.code = "EINVAL";
        newErr.errno = -4071;
        newErr.syscall = "readlink";
        throw newErr;
      }
      throw err;
    }
  };

  if (origPromisesReadlink) {
    fs.promises.readlink = async function (...args: any[]) {
      try {
        return await (origPromisesReadlink as any).apply(fs.promises, args);
      } catch (err: any) {
        if (err && err.code === "EISDIR") {
          const newErr: any = new Error(`EINVAL: invalid argument, readlink '${args[0]}'`);
          newErr.code = "EINVAL";
          newErr.errno = -4071;
          newErr.syscall = "readlink";
          throw newErr;
        }
        throw err;
      }
    };
  }
}

patchFsReadlink();

class FixRaiDrivePlugin {
  apply(compiler: any) {
    const patchFs = (fsObj: any) => {
      if (!fsObj || !fsObj.readlink || fsObj.__patchedRaiDrive) return;
      fsObj.__patchedRaiDrive = true;
      const orig = fsObj.readlink.bind(fsObj);
      fsObj.readlink = (targetPath: any, callback: any) => {
        return orig(targetPath, (err: any, link: any) => {
          if (err && (err.code === "EISDIR" || err.message?.includes("EISDIR"))) {
            const newErr: any = new Error(`EINVAL: invalid argument, readlink '${targetPath}'`);
            newErr.code = "EINVAL";
            return callback(newErr);
          }
          return callback(err, link);
        });
      };
    };

    patchFs(compiler.inputFileSystem);
    compiler.hooks.beforeRun.tap("FixRaiDrivePlugin", () => {
      patchFs(compiler.inputFileSystem);
    });
    compiler.hooks.compilation.tap("FixRaiDrivePlugin", (compilation: any) => {
      patchFs(compilation.inputFileSystem);
    });
  }
}

// 自动动态获取当前项目所在根目录的名称（例如 'math'、'Math' 或任意自定义目录名）
const currentDirName = path.basename(process.cwd());

// 优先使用 BASE_PATH 环境变量；若未提供，则全自动匹配当前根目录名称
const basePath =
  process.env.BASE_PATH !== undefined
    ? process.env.BASE_PATH
    : (currentDirName && currentDirName !== '.' ? `/${currentDirName}` : '');

console.log(`[Next.js Build] Auto-detected basePath: "${basePath}"`);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.cache = false;
    config.plugins.push(new FixRaiDrivePlugin());
    return config;
  },
};

export default nextConfig;
