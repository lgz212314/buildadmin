import { Module } from 'vuex'
import { ConfigStateTypes, RootStateTypes } from '/@/store/interface/index'
import { Local } from '/@/utils/storage'
import { CONFIG } from '/@/store/constant/cacheKey'
import { useCssVar } from '@vueuse/core'
import { ref } from 'vue'

interface setObj {
    name: string
    value: any
}

// State 默认值 => 与缓存中存有的数据合并来赋初始值
var state: ConfigStateTypes = {
    // 默认语言，可选值<zh-cn|en>
    defaultLang: 'zh-cn',
    // 当在默认语言包找不到翻译时，继续在 fallbackLang 语言包内查找翻译
    fallbackLang: 'zh-cn',
    // 支持的语言列表
    langArray: [
        { name: 'zh-cn', value: '中文简体' },
        { name: 'en', value: 'English' },
    ],
    layout: {
        // 后台布局方式，可选值<Default|Classic|Streamline>
        layoutMode: 'Default',
        // 后台主页面切换动画，可选值<slide-right|slide-left|el-fade-in-linear|el-fade-in|el-zoom-in-center|el-zoom-in-top|el-zoom-in-bottom>
        mainAnimation: 'slide-right',
        // 侧边菜单宽度(展开时)
        menuWidth: '260px',
        // 侧边菜单项默认图标
        menuDefaultIcon: 'el-icon-Minus',
        // 是否水平折叠收起菜单
        menuCollapse: false,
        // 是否只保持一个子菜单的展开(手风琴)
        menuUniqueOpened: false,
        // 侧边菜单背景色
        menuBackground: '#ffffff',
        // 侧边菜单激活项背景色
        menuActiveBackground: 'transparent',
        // 侧边菜单激活项字体色
        menuActiveColor: '#409eff',
        // 侧边菜单顶栏背景色
        menuTopBarBackground: '#fcfcfc',
        // 顶栏背景色(若布局需要才使用)
        headerBarBackground: 'transparent',
        // 顶栏激活项背景色
        headerBarTabActiveBackground: '#ffffff',
        // 顶栏激活项字体色
        headerBarTabActiveColor: '#000000',
    },
}
const baConfig = Local.get(CONFIG) || {}
state = { ...state, ...baConfig }

const ConfigModule: Module<ConfigStateTypes, RootStateTypes> = {
    namespaced: true,
    state,
    getters: {
        menuCollapse: (state, getters) => {
            let menuCollapse = state.layout.menuCollapse
            useCssVar('--default-aside-width', ref(null)).value = menuCollapse ? '64px' : '260px'
            return menuCollapse
        },
    },
    mutations: {
        // 设置单个配置项
        set(state: any, data: setObj): void {
            state[data.name] = data.value
        },
        // 批量设置配置项
        setMulti(state: any, data: object): void {
            for (let [key, val] of Object.entries(data)) {
                state[key] = val
            }
        },
        // 设置单个配置项并缓存到本地存储
        // name 支持`.`，列如 layout.menuCollapse
        setAndCache(state: any, data: setObj): void {
            let baConfig = Local.get(CONFIG) || {}

            let name = data.name.split('.')
            if (name[1]) {
                state[name[0]][name[1]] = data.value
                if (!baConfig[name[0]]) {
                    baConfig[name[0]] = state[name[0]]
                }
                baConfig[name[0]][name[1]] = data.value
            } else {
                state[data.name] = baConfig[data.name] = data.value
            }
            Local.set(CONFIG, baConfig)
        },
    },
}

export default ConfigModule
