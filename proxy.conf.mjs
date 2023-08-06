export default [{
    context: ['/dev-config'],
    target: "http://192.168.58.129:80/config.json",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
}, {
    context: ['/dev-admin-api'],
    target: "http://192.168.58.129:8000",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
}];
