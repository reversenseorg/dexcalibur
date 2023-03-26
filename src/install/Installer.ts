import * as _os_ from "os"
import * as _path_ from "path";
import {LicenseManager} from "@dexcalibur/dexcalibur-installer/src/LicenseManager.js";
import {Installer} from "@dexcalibur/dexcalibur-installer/src/Installer.js";
import {Settings} from "../Settings.js";
import GlobalSettings = Settings.GlobalSettings;
import { CliFrontend } from "./CliFrontend.js";
import Util from "../Utils.js";

const DXC_HOME = ".dxc";

let licenseMgr:LicenseManager;
let installer:Installer;


export function install(pHomePath:string, pConfig:GlobalSettings = null){
    try{

        licenseMgr = new LicenseManager({
            defaultLang: "fr",
            lang: ["fr"],
            folder: _path_.join(Util.__dirname(import.meta.url),"..","..","assets","LICENSES")
        });


        installer = new Installer({
                productName: "Dexcalibur Pro Edition",
                icon: "",
                version: "1.0.0b",
                buildNumber: "1.2.0",
                home: pHomePath,
                requirements: {
                    java: {
                        name: "java",
                        version: {
                            min: "1.8.0",
                            cmd: "java -version",
                            io: ["err"],
                            line: 0,
                            pattern: /^(java|openjdk) version \"(?<version>[^_]+).*\"/
                        },
                        required: true
                    },
                    python: {
                        name: "python",
                        version: {
                            min: "3.0.0",
                            cmd: [["python","python3"],"-V"],
                            io: ["err","out"],
                            line: 0,
                            pattern: /^Python (?<version>.+)/
                        },
                        required: true
                    },
                    pip: {
                        name: "pip",
                        require: ["python"],
                        required: true,
                        silent: true,
                        version: {
                            min: "15.0.0",
                            cmd: [["pip","pip3"],"-V"],
                            io: ["out","out"],
                            line: 0,
                            pattern: /^pip (?<version>[^ ]+) from (?<dpath>[^ ]+) \\(python (?<python>.+)\\)/
                        }
                    },
                    adb: {
                        name: "adb",
                        version: {
                            min: "1.0.0",
                            location: {
                                type: "ws",
                                relPath: [".dxc","bin","platform-tools"]
                            },
                            cmd: "adb --version",
                            io: ["out"],
                            line: 0,
                            pattern: /^Android Debug Bridge version (?<version>[^ ]+)$/
                        },
                        install: {
                            online: {
                                darwin: {
                                    uri: "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip",
                                    compression: "zip",
                                    relPath: ["platform-tools"],
                                    dest: {
                                        overwrite: false,
                                        location: "ws",
                                        uri: ["platform-tools"],
                                        attr: "777"
                                    },
                                    installer: "dl"
                                },
                                linux: {
                                    uri: "https://dl.google.com/android/repository/platform-tools-latest-linux.zip",
                                    compression: "zip",
                                    relPath: ["platform-tools"],
                                    dest: {
                                        overwrite: false,
                                        location: "ws",
                                        uri: ["platform-tools"],
                                        attr: "777"
                                    },
                                    installer: "dl"
                                }
                            },
                            offline: {
                                darwin: {
                                    installer: "move",
                                    location: "thirdparty",
                                    uri: "android-tools.zip",
                                    relPath: ["platform-tools"],
                                    dest: {
                                        location: "ws",
                                        uri: ["platform-tools"],
                                        attr: "777",
                                        overwrite: false
                                    },
                                    compression: "zip"
                                },
                                linux: {
                                    installer: "move",
                                    location: "thirdparty",
                                    uri: "android-tools.zip",
                                    relPath: ["platform-tools"],
                                    dest: {
                                        location: "ws",
                                        uri: ["platform-tools"],
                                        attr: "777",
                                        overwrite: false
                                    },
                                    compression: "zip"
                                }
                            }
                        }
                    },
                    radare2: {
                        name: "radare2",
                        version: {
                            min: "5.0.0",
                            cmd: "r2 -v",
                            io: ["out"],
                            line: 0,
                            pattern: /^radare2 (?<version>[^-]+)(?:-git)? [0-9]+/
                        },
                        install: {
                            online: {
                                darwin: {
                                    uri: "https://github.com/radareorg/radare2/releases/download/5.1.1/radare2-5.1.1.pkg",
                                    sudo: true,
                                    installer: "pkg"
                                },
                                linux: {
                                    uri: "https://github.com/radareorg/radare2/releases/download/5.2.1/radare2_5.2.1_amd64.deb",
                                    sudo: true,
                                    installer: "deb"
                                },
                                win32: {
                                    uri: "https://github.com/radareorg/radare2/releases/download/5.2.1/radare2-5.2.1-w32.zip",
                                    installer: "exe",
                                    compression: "zip"
                                }
                            },
                            offline: {
                                win32: {
                                    location: "thirdparty",
                                    uri: "radare2.zip",
                                    installer: "exe",
                                    compression: "zip",
                                    sudo: true
                                },
                                darwin: {
                                    location: "thirdparty",
                                    uri: "radare2.pkg",
                                    installer: "pkg",
                                    sudo: true
                                },
                                linux: {
                                    location: "thirdparty",
                                    uri: "radare2.deb",
                                    installer: "deb",
                                    sudo: true
                                }
                            }
                        }
                    },
                    frida: {
                        name: "frida",
                        version: {
                            min: "12.0.0",
                            cmd: "frida --version",
                            io: ["out"],
                            line: 0,
                            pattern: /^(?<version>[^\"]+)$/
                        },
                        install: {
                            online: {
                                require: ["pip"],
                                darwin: {
                                    pkgName: "frida-tools",
                                    installer: "pip"
                                },
                                linux: {
                                    pkgName: "frida-tools",
                                    installer: "pip"
                                },
                                window: {
                                    pkgName: "frida-tools",
                                    installer: "pip"
                                }
                            },
                            offline: {
                                require: ["pip"],
                                darwin: {
                                    location: "thirdparty",
                                    uri: "frida-dependencies.zip",
                                    relPath: ["frida-dependencies"],
                                    pkgName: "frida-tools",
                                    compression: "zip",
                                    installer: "pip"
                                },
                                linux: {
                                    location: "thirdparty",
                                    uri: "frida-dependencies.zip",
                                    pkgName: "frida-tools",
                                    compression: "zip",
                                    installer: "pip"
                                },
                                win32: {
                                    location: "thirdparty",
                                    uri: "frida-dependencies.zip",
                                    pkgName: "frida-tools",
                                    compression: "zip",
                                    installer: "pip"
                                }
                            }
                        }
                    }
                },
                bundled: {
                    apktool: {
                        name: "apktool",
                        install: {
                            offline: {
                                darwin: {
                                    installer: "move",
                                    location: "thirdparty",
                                    uri:  "apktool.jar",
                                    dest: {
                                        overwrite: false,
                                        location: "ws",
                                        uri: [
                                            "apktool.jar"
                                        ],
                                        attr: "777"
                                    }
                                },
                                linux: {
                                    installer: "move",
                                    location: "thirdparty",
                                    uri:  "apktool.jar",
                                    dest: {
                                        overwrite: false,
                                        location: "ws",
                                        uri: [
                                            "apktool.jar"
                                        ],
                                        attr: "777"
                                    }
                                },
                                win32: {
                                    installer: "move",
                                    location: "thirdparty",
                                    uri:  "apktool.jar",
                                    dest: {
                                        overwrite: false,
                                        location: "ws",
                                        uri: [
                                            "apktool.jar"
                                        ],
                                        attr: "777"
                                    }
                                }
                            }
                        }
                    },
                    baksmali: {
                        name: "baksmali",
                        install: {
                            offline: {
                                darwin: {
                                    installer: "move",
                                    location: "thirdparty",
                                    uri: "baksmali.jar",
                                    dest: {
                                        overwrite: false,
                                        location: "ws",
                                        uri: [
                                            "baksmali.jar"
                                        ],
                                        attr: "777"
                                    }
                                },
                                linux: {
                                    installer: "move",
                                    location: "thirdparty",
                                    uri: "baksmali.jar",
                                    dest: {
                                        overwrite: false,
                                        location: "ws",
                                        uri: [
                                            "baksmali.jar"
                                        ],
                                        attr: "777"
                                    }
                                },
                                win32: {
                                    installer: "move",
                                    location: "thirdparty",
                                    uri: "baksmali.jar",
                                    dest: {
                                        overwrite: false,
                                        location: "ws",
                                        uri: [
                                            "baksmali.jar"
                                        ],
                                        attr: "777"
                                    }
                                }
                            }
                        }
                    },
                    binwalk: {
                        name: "binwalk",
                        version: {
                            min: "2.0.0",
                            cmd: "binwalk -h",
                            io: [
                                "out"
                            ],
                            line: 1,
                            pattern: /^Binwalk v(?<version>[^ ]+)/
                        },
                        install: {
                            offline: {
                                require: ["python"],
                                darwin: {
                                    installer: "python",
                                    location: "thirdparty",
                                    uri: "binwalk.zip",
                                    relPath: ["binwalk-master","setup.py"],
                                    compression: "zip",
                                    sudo: true
                                },
                                linux: {
                                    installer: "python",
                                    location: "thirdparty",
                                    uri: "binwalk.zip",
                                    relPath: ["binwalk-master","setup.py"],
                                    compression: "zip",
                                    sudo: true
                                },
                                win32: {
                                    installer: "python",
                                    location: "thirdparty",
                                    uri: "binwalk.zip",
                                    compression: "zip",
                                    sudo: true
                                }
                            }
                        }
                    }
                }
            }, pConfig,licenseMgr
        );

        //console.log(licenseMgr);
        //console.log(installer);

        const CLI = new CliFrontend(installer, licenseMgr, "Reversense 2021 - 2023");
        CLI.start();
    }catch (err){
        console.log(JSON.stringify(err));
        console.log(err.message);
        console.log(err.stack);
    }

}