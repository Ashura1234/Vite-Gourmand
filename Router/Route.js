
export default class Route {
    constructor(url, title, pathHtml, pathJS = "", hideLayout = false) {
        this.url = url;
        this.title = title;
        this.pathHtml = pathHtml;
        this.pathJS = pathJS;
        this.hideLayout = hideLayout;
    }
}