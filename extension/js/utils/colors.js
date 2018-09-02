const COLOR_REGEX = /rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/;

class Colors{
    constructor(){
        this.colorCache = new Map();
        this.factor = 0.2;
        this.light = true;
    }

    changeLight(val){
        this.light = Boolean(val);
    }

    changeFactor(factor){
        this.factor = factor;
    }

    // getRandomColor(){
    //     const usable = '89ABCDEF'.split('');
    //     const l = usable.length;
    //     let color = '#';
    //     let i;
    //     for (let i = 0; i < 6; i++ ) {
    //         color += usable[Math.floor(Math.random() * l)];
    //     }
    //     return color;
    // }

    getRandomColor(lightness) {
      return `hsl(${Math.floor(Math.random()*360)}, ${Math.floor(Math.random()*100)}%, ${lightness}%)`;
    }

    convertColor(hex){
        // const colorRgb = COLOR_REGEX.exec(raw);
        // let color = colorRgb ? colors.getHex({r: colorRgb[1], g: colorRgb[2], b: colorRgb[3]}) : null;
        let color = this.calculateColor(hex);
        return color;
    }
    
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = Math.min(Math.max(0, (max + min) / 2), 1);
        const d = Math.min(Math.max(0, max - min), 1);

        if (d === 0) {
            return [d, d, l]; // achromatic
        }

        let h;
        switch (max) {
            case r: h = Math.min(Math.max(0, (g - b) / d + (g < b ? 6 : 0)), 6); break;
            case g: h = Math.min(Math.max(0, (b - r) / d + 2), 6); break;
            case b: h = Math.min(Math.max(0, (r - g) / d + 4), 6); break;
        }
        h /= 6;

        let s = l > 0.5 ? d / (2 * (1 - l)) : d / (2 * l);
        s = Math.min(Math.max(0, s), 1);

        return [h, s, l];
    }

    hslToRgb(h, s, l) {
        const hueToRgb = (pp, qq, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return pp + (qq - pp) * 6 * t;
            if (t < 1 / 2) return qq;
            if (t < 2 / 3) return pp + (qq - pp) * (2 / 3 - t) * 6;
            return pp;
        };

        if (s === 0) {
            const rgb = Math.round(Math.min(Math.max(0, 255 * l), 255)); // achromatic
            return [rgb, rgb, rgb];
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return [
            Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h + 1 / 3)), 255)),
            Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h)), 255)),
            Math.round(Math.min(Math.max(0, 255 * hueToRgb(p, q, h - 1 / 3)), 255))
        ];
    }

    calculateColorReplacement(color) {
        const light = this.light;
        const factor = light ? this.factor : -this.factor;

        color = color.replace(/[^0-9a-f]/gi, '');
        if (color.length < 6) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }

        let r = parseInt(color.substr(0, 2), 16);
        let g = parseInt(color.substr(2, 2), 16);
        let b = parseInt(color.substr(4, 2), 16);
        const hsl = this.rgbToHsl(r, g, b);

        // more thoroughly lightens dark colors, with no problems at black
        let l = light ? 1 - (1 - factor) * (1 - hsl[2]) : (1 + factor) * hsl[2];
        l = Math.min(Math.max(0, l), 1);

        const rgb = this.hslToRgb(hsl[0], hsl[1], l);
        r = rgb[0].toString(16);
        g = rgb[1].toString(16);
        b = rgb[2].toString(16);

        // note to self: .toString(16) does NOT zero-pad
        return '#' + ('00' + r).substr(r.length) +
                     ('00' + g).substr(g.length) +
                     ('00' + b).substr(b.length);
    }

    calculateColor(color) {
        const cacheKey = `${color}`;
        if (this.colorCache.has(cacheKey)) return this.colorCache.get(cacheKey);

        const colorRegex = /^#[0-9a-f]+$/i;
        if (!colorRegex.test(color)) return color;

        color = this.calculateColorReplacement(color);

        this.colorCache.set(cacheKey, color);
        if (this.colorCache.size > 1000) {
            this.colorCache.delete(this.colorCache.entries().next().value[0]);
        }
        return color;
    }

    getRgb(color) {
        // Convert HEX to RGB
        const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return regex ? {
            r: parseInt(regex[1], 16),
            g: parseInt(regex[2], 16),
            b: parseInt(regex[3], 16)
        } : {
            r: 0,
            g: 0,
            b: 0
        };
    }

    getHex(color) {
        // Convert RGB object to HEX String
        const convert = c => ('0' + parseInt(c, 10).toString(16)).slice(-2);
        return '#' + convert(color.r) + convert(color.g) + convert(color.b);
    }

}

const colors = new Colors();
export {colors};
