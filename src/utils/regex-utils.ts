import { UUID_REGEX } from '@/constants/bot.js';

export class RegexUtils {
    public static getStateId(s: string) {
        const match = s.match(UUID_REGEX);

        if (!match) {
            throw new Error('The string does not contain UUID: ' + s);
        }

        return match[0];
    }

    /**
     * Get name of a message component
     * @param {string} s Usually customId from a component interaction
     */
    public static getComponentName(s: string) {
        const match = s.replace(UUID_REGEX, '');

        if (!match) {
            throw new Error('The string does not contain a component name: ' + s);
        }

        // After UUID is stripped off there's still a dash left at the end
        // like this: "pick-election-menu-"
        return match.substring(0, match.length - 1);
    }
}
