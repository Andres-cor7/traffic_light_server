/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ["asus-de-andres.tail222bcc.ts.net"] //Cambiar esto al servidor de origen
};

export default nextConfig;
