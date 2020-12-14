job("Run npm test") {
    container("node:alpine") {
        env["REGISTRY"] = "https://npm.pkg.jetbrains.space/reversense/p/dexcalibur/dxc-npm"
        shellScript {
            interpreter = "/bin/sh"
            content = """
                echo Install npm dependencies...
                npm ci
                echo Run build if it exists in package.json...
                npm run build --if-present
                echo Run tests...
                npm run test
            """
        }
    }
}