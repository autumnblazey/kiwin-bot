// WARNING NOT TESTED WITH DIRECTORIES THAT HAVE SPACES IN THEM

import { spawn } from "child_process";
import path from "path";

const dbdir = path.resolve(process.cwd(), "./prisma/THE-DATABASE--GASP");
const dbfile = path.resolve(dbdir, "./kiwindb");

export function backup() {
   const backupfile = path.resolve(dbdir, `kiwindb-backup-${Date.now()}`);
   spawn("sqlite3", [dbfile, `.backup ${backupfile}`], { cwd: process.cwd() });
}
