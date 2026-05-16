"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotsManager = void 0;
const robots_parser_1 = __importDefault(require("robots-parser"));
const axios_1 = __importDefault(require("axios"));
class RobotsManager {
    cache = new Map();
    async isAllowed(url, userAgent = '*') {
        try {
            const parsedUrl = new URL(url);
            const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;
            let robots = this.cache.get(robotsUrl);
            if (!robots) {
                try {
                    const response = await axios_1.default.get(robotsUrl, { timeout: 5000 });
                    robots = (0, robots_parser_1.default)(robotsUrl, response.data);
                    this.cache.set(robotsUrl, robots);
                }
                catch (e) {
                    // If robots.txt doesn't exist or fails, assume everything is allowed
                    return true;
                }
            }
            return robots.isAllowed(url, userAgent) ?? true;
        }
        catch (e) {
            return true;
        }
    }
}
exports.RobotsManager = RobotsManager;
