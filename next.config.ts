// @ts-nocheck
import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Windows RaiDrive / 가상 네트워크 드라이브에서 fs.readlink가 EINVAL 대신 EISDIR을 반환하여 Webpack이 충돌하는 문제 패치
function patchFsReadlink() {
  const origRealpathSync = fs.realpathSync;
  fs.realpathSync = function (...args: any[]) {
    try {
      return (origRealpathSync as any).apply(fs, args);
    } catch {
      return args[0];
    }
  };
  fs.realpathSync.native = fs.realpathSync;

  const origPromisesRealpath = fs.promises?.realpath;
  if (fs.promises) {
    fs.promises.realpath = async function (...args: any[]) {
      try {
        return await (origPromisesRealpath as any).apply(fs.promises, args);
      } catch {
        return args[0];
      }
    };
    (fs.promises.realpath as any).native = fs.promises.realpath;
  }

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

  // Windows RaiDrive 가상 드라이브에서 다중 스레드/비동기 mkdir 시 EPERM 레이스 컨디션 방어
  const origMkdir = fs.mkdir;
  const origMkdirSync = fs.mkdirSync;
  const origPromisesMkdir = fs.promises?.mkdir;

  fs.mkdirSync = function (...args: any[]) {
    try {
      return (origMkdirSync as any).apply(fs, args);
    } catch (err: any) {
      if (err && (err.code === "EPERM" || err.code === "EEXIST" || err.message?.includes("EPERM"))) {
        try {
          (origMkdirSync as any).call(fs, args[0], { recursive: true });
          return undefined;
        } catch {
          if (fs.existsSync(args[0])) return undefined;
        }
      }
      throw err;
    }
  };

  fs.mkdir = function (...args: any[]) {
    const cb = typeof args[args.length - 1] === "function" ? args.pop() : null;
    if (cb) {
      return (origMkdir as any).call(fs, ...args, (err: any, res: any) => {
        if (err && (err.code === "EPERM" || err.code === "EEXIST" || err.message?.includes("EPERM"))) {
          try {
            (origMkdirSync as any).call(fs, args[0], { recursive: true });
            return cb(null, res);
          } catch {
            if (fs.existsSync(args[0])) return cb(null, res);
          }
        }
        return cb(err, res);
      });
    }
    return (origMkdir as any).apply(fs, args);
  };

  if (origPromisesMkdir) {
    fs.promises.mkdir = async function (...args: any[]) {
      try {
        return await (origPromisesMkdir as any).apply(fs.promises, args);
      } catch (err: any) {
        if (err && (err.code === "EPERM" || err.code === "EEXIST")) {
          if (fs.existsSync(args[0])) return undefined;
          await new Promise((r) => setTimeout(r, 60));
          if (fs.existsSync(args[0])) return undefined;
          try { return await (origPromisesMkdir as any).apply(fs.promises, args); } catch {}
          if (fs.existsSync(args[0])) return undefined;
        }
        throw err;
      }
    };
  }

  const isInvalidNestedPath = (p: any) => {
    if (typeof p !== 'string') return false;
    const match = p.match(/(.*?)\.(js|jsx|ts|tsx|mjs|cjs|json)[/\\](.+)/i);
    if (!match) return false;
    const filePart = match[1] + '.' + match[2];
    try {
      const s = origStatSync(filePart);
      if (s.isDirectory()) return false;
      return true;
    } catch {
      return false;
    }
  };

  const origStat = fs.stat;
  const origStatSync = fs.statSync;
  const origReadFile = fs.readFile;
  const origReadFileSync = fs.readFileSync;

  fs.statSync = function (...args: any[]) {
    if (isInvalidNestedPath(args[0])) {
      const err: any = new Error(`ENOTDIR: not a directory, stat '${args[0]}'`);
      err.code = "ENOTDIR";
      throw err;
    }
    return (origStatSync as any).apply(fs, args);
  };

  fs.stat = function (...args: any[]) {
    const cb = typeof args[args.length - 1] === "function" ? args.pop() : null;
    if (cb && isInvalidNestedPath(args[0])) {
      const err: any = new Error(`ENOTDIR: not a directory, stat '${args[0]}'`);
      err.code = "ENOTDIR";
      return cb(err);
    }
    return (origStat as any).apply(fs, args);
  };

  fs.readFileSync = function (...args: any[]) {
    if (isInvalidNestedPath(args[0])) {
      const err: any = new Error(`ENOTDIR: not a directory, open '${args[0]}'`);
      err.code = "ENOTDIR";
      throw err;
    }
    return (origReadFileSync as any).apply(fs, args);
  };

  fs.readFile = function (...args: any[]) {
    const cb = typeof args[args.length - 1] === "function" ? args.pop() : null;
    if (cb && isInvalidNestedPath(args[0])) {
      const err: any = new Error(`ENOTDIR: not a directory, open '${args[0]}'`);
      err.code = "ENOTDIR";
      return cb(err);
    }
    return (origReadFile as any).apply(fs, args);
  };
}

patchFsReadlink();

class FixRaiDrivePlugin {
  apply(compiler: any) {
    const isInvalidNestedPath = (p: any) => {
      if (typeof p !== 'string') return false;
      const match = p.match(/(.*?)\.(js|jsx|ts|tsx|mjs|cjs|json)[/\\](.+)/i);
      if (!match) return false;
      const filePart = match[1] + '.' + match[2];
      try {
        const s = fs.statSync(filePart);
        if (s.isDirectory()) return false;
        return true;
      } catch {
        return false;
      }
    };

    const patchFs = (fsObj: any) => {
      if (!fsObj) return;

      if (fsObj.readlink && !fsObj.__patchedReadlink) {
        fsObj.__patchedReadlink = true;
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
      }

      if (fsObj.stat && !fsObj.__patchedStat) {
        fsObj.__patchedStat = true;
        const origStat = fsObj.stat.bind(fsObj);
        fsObj.stat = (...args: any[]) => {
          const callback = typeof args[args.length - 1] === "function" ? args.pop() : null;
          if (callback && isInvalidNestedPath(args[0])) {
            const err: any = new Error(`ENOTDIR: not a directory, stat '${args[0]}'`);
            err.code = "ENOTDIR";
            return callback(err);
          }
          return origStat(...args, callback);
        };
      }

      if (fsObj.readFile && !fsObj.__patchedReadFile) {
        fsObj.__patchedReadFile = true;
        const origReadFile = fsObj.readFile.bind(fsObj);
        fsObj.readFile = (...args: any[]) => {
          const callback = typeof args[args.length - 1] === "function" ? args.pop() : null;
          if (callback && isInvalidNestedPath(args[0])) {
            const err: any = new Error(`ENOTDIR: not a directory, open '${args[0]}'`);
            err.code = "ENOTDIR";
            return callback(err);
          }
          return origReadFile(...args, callback);
        };
      }

      if (fsObj.mkdir && !fsObj.__patchedMkdir) {
        fsObj.__patchedMkdir = true;
        const origMkdir = fsObj.mkdir.bind(fsObj);
        fsObj.mkdir = (...args: any[]) => {
          const callback = typeof args[args.length - 1] === "function" ? args.pop() : null;
          const targetDir = args[0];
          if (callback) {
            return origMkdir(...args, (err: any, res: any) => {
              if (err && (err.code === "EPERM" || err.code === "EEXIST" || err.message?.includes("EPERM"))) {
                try {
                  fs.mkdirSync(targetDir, { recursive: true });
                  return callback(null, res);
                } catch {
                  if (fs.existsSync(targetDir)) return callback(null, res);
                }
              }
              callback(err, res);
            });
          }
          return origMkdir(...args);
        };
      }
    };

    patchFs(compiler.inputFileSystem);
    patchFs(compiler.outputFileSystem);
    compiler.hooks.beforeRun.tap("FixRaiDrivePlugin", () => {
      patchFs(compiler.inputFileSystem);
      patchFs(compiler.outputFileSystem);
    });
    compiler.hooks.compilation.tap("FixRaiDrivePlugin", (compilation: any) => {
      patchFs(compilation.inputFileSystem);
      patchFs(compilation.outputFileSystem);
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
  experimental: {
    webpackBuildWorker: false,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  webpack: (config) => {
    config.resolve.symlinks = false;
    config.cache = false;
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(process.cwd(), 'src'),
    };
    config.plugins.push(new FixRaiDrivePlugin());
    return config;
  },
};

export default nextConfig;
