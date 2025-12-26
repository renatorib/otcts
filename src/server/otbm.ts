import fs from "fs";
import path from "path";

import { OtbmManager } from "../core/otbm/OtbmManager";

const OTBM_PATH = path.resolve(__dirname, "../../data/server/world.otbm");

const otbm = new OtbmManager();

otbm.loadOtbmFromBuffer(fs.readFileSync(OTBM_PATH).buffer);

console.log(JSON.stringify(otbm, null, 2));
