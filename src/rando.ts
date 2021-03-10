export function getenv(env: string) {
   const envthing = process.env[env];
   if (envthing) return envthing;
   throw `process.env["${env}"] no exist`;
}
