export class StringExtensions {
    static format(s: string, ...args: any[]) {
        let formatted = s;
        for (let i = 0; i < args.length; i++) {
            formatted = formatted.replace(
                RegExp("\\{" + i + "\\}", 'g'), args[i].toString());
        }
        return formatted;
    }
    static contains(s: string, s2: string) {
        return s.indexOf(s2) != -1;
    }
}
