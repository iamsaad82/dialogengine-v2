"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/html-url-attributes@3.0.1";
exports.ids = ["vendor-chunks/html-url-attributes@3.0.1"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/html-url-attributes@3.0.1/node_modules/html-url-attributes/lib/index.js":
/*!****************************************************************************************************!*\
  !*** ./node_modules/.pnpm/html-url-attributes@3.0.1/node_modules/html-url-attributes/lib/index.js ***!
  \****************************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   urlAttributes: () => (/* binding */ urlAttributes)\n/* harmony export */ });\n/**\n * HTML URL properties.\n *\n * Each key is a property name and each value is a list of tag names it applies\n * to or `null` if it applies to all elements.\n *\n * @type {Record<string, Array<string> | null>}\n */ const urlAttributes = {\n    action: [\n        \"form\"\n    ],\n    cite: [\n        \"blockquote\",\n        \"del\",\n        \"ins\",\n        \"q\"\n    ],\n    data: [\n        \"object\"\n    ],\n    formAction: [\n        \"button\",\n        \"input\"\n    ],\n    href: [\n        \"a\",\n        \"area\",\n        \"base\",\n        \"link\"\n    ],\n    icon: [\n        \"menuitem\"\n    ],\n    itemId: null,\n    manifest: [\n        \"html\"\n    ],\n    ping: [\n        \"a\",\n        \"area\"\n    ],\n    poster: [\n        \"video\"\n    ],\n    src: [\n        \"audio\",\n        \"embed\",\n        \"iframe\",\n        \"img\",\n        \"input\",\n        \"script\",\n        \"source\",\n        \"track\",\n        \"video\"\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vaHRtbC11cmwtYXR0cmlidXRlc0AzLjAuMS9ub2RlX21vZHVsZXMvaHRtbC11cmwtYXR0cmlidXRlcy9saWIvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7O0NBT0MsR0FDTSxNQUFNQSxnQkFBZ0I7SUFDM0JDLFFBQVE7UUFBQztLQUFPO0lBQ2hCQyxNQUFNO1FBQUM7UUFBYztRQUFPO1FBQU87S0FBSTtJQUN2Q0MsTUFBTTtRQUFDO0tBQVM7SUFDaEJDLFlBQVk7UUFBQztRQUFVO0tBQVE7SUFDL0JDLE1BQU07UUFBQztRQUFLO1FBQVE7UUFBUTtLQUFPO0lBQ25DQyxNQUFNO1FBQUM7S0FBVztJQUNsQkMsUUFBUTtJQUNSQyxVQUFVO1FBQUM7S0FBTztJQUNsQkMsTUFBTTtRQUFDO1FBQUs7S0FBTztJQUNuQkMsUUFBUTtRQUFDO0tBQVE7SUFDakJDLEtBQUs7UUFDSDtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7S0FDRDtBQUNILEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90ZW1wLW5leHQvLi9ub2RlX21vZHVsZXMvLnBucG0vaHRtbC11cmwtYXR0cmlidXRlc0AzLjAuMS9ub2RlX21vZHVsZXMvaHRtbC11cmwtYXR0cmlidXRlcy9saWIvaW5kZXguanM/NTBhOCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEhUTUwgVVJMIHByb3BlcnRpZXMuXG4gKlxuICogRWFjaCBrZXkgaXMgYSBwcm9wZXJ0eSBuYW1lIGFuZCBlYWNoIHZhbHVlIGlzIGEgbGlzdCBvZiB0YWcgbmFtZXMgaXQgYXBwbGllc1xuICogdG8gb3IgYG51bGxgIGlmIGl0IGFwcGxpZXMgdG8gYWxsIGVsZW1lbnRzLlxuICpcbiAqIEB0eXBlIHtSZWNvcmQ8c3RyaW5nLCBBcnJheTxzdHJpbmc+IHwgbnVsbD59XG4gKi9cbmV4cG9ydCBjb25zdCB1cmxBdHRyaWJ1dGVzID0ge1xuICBhY3Rpb246IFsnZm9ybSddLFxuICBjaXRlOiBbJ2Jsb2NrcXVvdGUnLCAnZGVsJywgJ2lucycsICdxJ10sXG4gIGRhdGE6IFsnb2JqZWN0J10sXG4gIGZvcm1BY3Rpb246IFsnYnV0dG9uJywgJ2lucHV0J10sXG4gIGhyZWY6IFsnYScsICdhcmVhJywgJ2Jhc2UnLCAnbGluayddLFxuICBpY29uOiBbJ21lbnVpdGVtJ10sXG4gIGl0ZW1JZDogbnVsbCxcbiAgbWFuaWZlc3Q6IFsnaHRtbCddLFxuICBwaW5nOiBbJ2EnLCAnYXJlYSddLFxuICBwb3N0ZXI6IFsndmlkZW8nXSxcbiAgc3JjOiBbXG4gICAgJ2F1ZGlvJyxcbiAgICAnZW1iZWQnLFxuICAgICdpZnJhbWUnLFxuICAgICdpbWcnLFxuICAgICdpbnB1dCcsXG4gICAgJ3NjcmlwdCcsXG4gICAgJ3NvdXJjZScsXG4gICAgJ3RyYWNrJyxcbiAgICAndmlkZW8nXG4gIF1cbn1cbiJdLCJuYW1lcyI6WyJ1cmxBdHRyaWJ1dGVzIiwiYWN0aW9uIiwiY2l0ZSIsImRhdGEiLCJmb3JtQWN0aW9uIiwiaHJlZiIsImljb24iLCJpdGVtSWQiLCJtYW5pZmVzdCIsInBpbmciLCJwb3N0ZXIiLCJzcmMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/html-url-attributes@3.0.1/node_modules/html-url-attributes/lib/index.js\n");

/***/ })

};
;