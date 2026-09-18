declare module 'juice' {
  interface JuiceOptions {
    removeStyleTags?: boolean;
    applyStyleTags?: boolean;
    preserveMediaQueries?: boolean;
    [key: string]: any;
  }
  function juice(html: string, options?: JuiceOptions): string;
  namespace juice {
    export { JuiceOptions };
  }
  export default juice;
}
