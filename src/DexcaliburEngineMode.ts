/**
 * Running mode of engine instance :
 * - master : manage several slave engines, and expose GUIs
 * - slave : headless engine used to distribute processing
 *
 *
 */
export enum DexcaliburEngineMode {
    MASTER = "MASTER",
    SLAVE = "SLAVE",
    STANDALONE = "STANDALONE"
}