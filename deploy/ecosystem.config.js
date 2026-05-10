// PM2 process file
// Usage:
//   pm2 start deploy/ecosystem.config.js
//   pm2 save
//   pm2 startup   # follow the printed command to enable on boot

module.exports = {
  apps: [
    {
      name: "uzmanrot",
      // Standalone server produced by `next build` (output: "standalone")
      script: "./.next/standalone/server.js",
      cwd: "/var/www/uzmanrot",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      out_file: "/var/log/uzmanrot/out.log",
      error_file: "/var/log/uzmanrot/err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
