// @ts-nocheck
import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Windows RaiDrive / 가상 네트워크 드라이브에서 fs.readlink가 EINVAL 대신 EISDIR을 반환하여 Webpack이 충돌하는 문제 패치
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

// 현재 프로젝트의 루트 디렉터리 이름(예: 'math', 'Math' 등)을 동적으로 감지
const currentDirName = path.basename(process.cwd());

// BASE_PATH 환경 변수를 우선 적용하며, 미지정 시 현재 루트 디렉터리 이름으로 자동 매핑
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
