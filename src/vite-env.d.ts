/// <reference types="vite/client" />

// 仅保留Vite基础类型，删除所有扩展（避免TS报错）
declare module '*.vue' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}