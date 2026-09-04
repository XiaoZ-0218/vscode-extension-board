// 精选扩展目录：id 为官方市场唯一标识（publisher.name），note 为推荐理由
const CATEGORIES = [
  { id: 'new',      name: '新锐精选', icon: '🆕' },
  { id: 'lang',     name: '语言支持', icon: '🧩' },
  { id: 'quality',  name: '代码质量', icon: '✨' },
  { id: 'git',      name: 'Git 协作', icon: '🌿' },
  { id: 'theme',    name: '界面主题', icon: '🎨' },
  { id: 'fun',      name: '摸鱼炫技', icon: '🐟' },
  { id: 'tools',    name: '效率工具', icon: '⚡' },
  { id: 'frontend', name: '前端开发', icon: '🖥️' },
  { id: 'remote',   name: '远程容器', icon: '📦' },
  { id: 'ai',       name: 'AI 编程',  icon: '🤖' },
  { id: 'data',     name: '数据接口', icon: '🗄️' },
  { id: 'docs',     name: '文档写作', icon: '📝' },
  { id: 'debug',    name: '调试可视', icon: '🔬' },
  { id: 'read',     name: '阅读翻译', icon: '📖' },
  { id: 'devops',   name: '工程配置', icon: '🛠️' },
];

// 🎲 惊喜池：随机推荐只从这里抽 —— 刻意排除人人皆知的“教科书”扩展，
// 只留好玩、巧妙、让人“咦？还有这种操作”的宝藏。
const WOW_POOL = [
  // 摸鱼炫技全员
  'hoovercj.vscode-power-mode', 'giscafer.leek-fund', 'adpyke.codesnap',
  'johnpapa.vscode-peacock', 'WakaTime.vscode-wakatime', 'softwaredotcom.swdc-vscode',
  'ms-vscode.vscode-speech',
  // 新锐里的异类
  'astral-sh.ty', 'modular-mojotools.vscode-mojo', 'rjmacarthy.twinny',
  'oven.bun-vscode', 'yoavbls.pretty-ts-errors', 'wallabyjs.console-ninja',
  'mattpocock.ts-error-translator', 'fill-labs.dependi',
  // 效率工具里的巧思
  'quicktype.quicktype', 'obkoro1.korofileheader', 'wmaurer.change-case',
  'oderwat.indent-rainbow', 'wix.vscode-import-cost',
  // 调试可视化
  'hediet.debug-visualizer', 'wallabyjs.quokka-vscode', 'kisstkondoros.vscode-codemetrics',
  // 阅读翻译全员
  'intellsmi.comment-translate', 'funkyremi.vscode-google-translate', 'tomoki1207.pdf',
  'kisstkondoros.vscode-gutter-preview', 'ibm.output-colorizer',
  // 文档里的魔法
  'pomdtr.excalidraw-editor', 'antfu.slidev', 'bierner.emojisense',
  'bierner.markdown-mermaid', 'hediet.vscode-drawio',
  // 颜值惊喜
  'robbowen.synthwave-vscode', 'EliverLara.andromeda', 'sainnhe.everforest',
  // 前端彩蛋
  'antfu.iconify', 'antfu.unocss',
  // 数据把玩
  'ms-toolsai.datawrangler', 'qwtel.sqlite-viewer', 'mechatroner.rainbow-csv',
  'ms-vscode.hexeditor', 'GrapeCity.gc-excelviewer',
  // 杂项惊喜
  'github.remotehub', 'ziglang.vscode-zig', 'denoland.vscode-deno',
];

const CATALOG = [
  // ── 🆕 新锐精选（近两年发布且口碑出色）─────
  { id: 'docker.docker',                    cat: 'new', note: 'Docker DX：2025 年新一代官方容器扩展，体验大翻新' },
  { id: 'astral-sh.ty',                     cat: 'new', note: 'Astral 新作：Rust 写的 Python 类型检查器，快得离谱' },
  { id: 'kilocode.kilo-code',               cat: 'new', note: '2025 年蹿红的 AI 编程代理，功能集大成者' },
  { id: 'ms-ossdata.vscode-pgsql',          cat: 'new', note: '微软 2025 新 PostgreSQL 扩展，数据库操作大升级' },
  { id: 'fill-labs.dependi',                cat: 'new', note: '依赖漏洞与过期检测新星，行内直接标风险' },
  { id: 'ms-azuretools.vscode-azure-github-copilot', cat: 'new', note: 'Copilot for Azure：云资源部署问答一体化' },
  { id: 'yoavbls.pretty-ts-errors',         cat: 'new', note: '把天书般的 TS 报错排成人话，前端救星' },
  { id: 'oven.bun-vscode',                  cat: 'new', note: 'Bun 官方扩展，新一代 JS 运行时全家桶' },
  { id: 'modular-mojotools.vscode-mojo',    cat: 'new', note: 'Mojo 🔥：AI 时代的系统级新语言官方支持' },
  { id: 'augment.vscode-augment',           cat: 'new', note: '为大代码库而生的 AI 编程代理新秀' },
  { id: 'rjmacarthy.twinny',                cat: 'new', note: '接 Ollama 的本地 AI 补全，免费不联网' },
  { id: 'sourcegraph.cody-ai',              cat: 'new', note: 'Sourcegraph 出品的 Cody，代码搜索基因强大' },
  { id: 'charliermarsh.ruff',               cat: 'new', note: 'Rust 写的 Python linter/格式化之王，横扫社区' },
  { id: 'wallabyjs.console-ninja',          cat: 'new', note: 'console.log 结果直接显示在行尾，调试少切窗' },
  { id: 'mattpocock.ts-error-translator',   cat: 'new', note: 'TS 报错翻译成人话，Total TypeScript 作者出品' },

  // ── 🧩 语言支持 ───────────────────────────
  { id: 'ms-python.python',                 cat: 'lang', note: 'Python 开发官方标配，调试、环境管理一应俱全' },
  { id: 'ms-python.vscode-pylance',         cat: 'lang', note: '极速类型检查与智能补全，Python 体验质变' },
  { id: 'ms-vscode.cpptools',               cat: 'lang', note: 'C/C++ 官方支持，IntelliSense 与调试都靠它' },
  { id: 'llvm-vs-code-extensions.vscode-clangd', cat: 'lang', note: 'LLVM 官方 clangd，大型 C++ 项目的补全救星' },
  { id: 'golang.go',                        cat: 'lang', note: 'Go 官方扩展，gopls 驱动的完整语言服务' },
  { id: 'rust-lang.rust-analyzer',          cat: 'lang', note: 'Rust 官方语言服务器，补全推断快而准' },
  { id: 'redhat.java',                      cat: 'lang', note: '红帽出品的 Java 语言支持，Maven/Gradle 通吃' },
  { id: 'ms-dotnettools.csharp',            cat: 'lang', note: 'C# 官方语言服务，.NET 开发基石' },
  { id: 'Vue.volar',                        cat: 'lang', note: 'Vue 3 官方插件，SFC 类型支持无可替代' },
  { id: 'svelte.svelte-vscode',             cat: 'lang', note: 'Svelte 官方支持，模板高亮与诊断齐全' },
  { id: 'sumneko.lua',                      cat: 'lang', note: 'Lua 语言服务器，游戏脚本开发必备' },
  { id: 'Dart-Code.dart-code',              cat: 'lang', note: 'Dart 官方支持，热重载与设备管理' },
  { id: 'Dart-Code.flutter',                cat: 'lang', note: 'Flutter 开发一条龙，真机模拟器随便跑' },
  { id: 'ziglang.vscode-zig',               cat: 'lang', note: 'Zig 官方语言支持，新锐系统语言尝鲜' },
  { id: 'haskell.haskell',                  cat: 'lang', note: 'Haskell 语言服务，函数式的优雅在此' },
  { id: 'Ionide.Ionide-fsharp',             cat: 'lang', note: 'F# 事实标准插件，.NET 函数式之门' },
  { id: 'Shopify.ruby-lsp',                 cat: 'lang', note: 'Shopify 出品的现代 Ruby 语言服务' },
  { id: 'denoland.vscode-deno',             cat: 'lang', note: 'Deno 官方支持，TS 免配置直接跑' },

  // ── ✨ 代码质量 ───────────────────────────
  { id: 'esbenp.prettier-vscode',           cat: 'quality', note: '最流行的格式化工具，保存即整洁' },
  { id: 'dbaeumer.vscode-eslint',           cat: 'quality', note: 'JS/TS 规则检查事实标准，团队规范守门员' },
  { id: 'usernamehw.errorlens',             cat: 'quality', note: '把报错警告直接标在行尾，问题无处遁形' },
  { id: 'streetsidesoftware.code-spell-checker', cat: 'quality', note: '代码拼写检查，告别变量名 typo' },
  { id: 'aaron-bond.better-comments',       cat: 'quality', note: '让 TODO、FIXME、注释分色高亮，一眼定位' },
  { id: 'sonarsource.sonarlint-vscode',     cat: 'quality', note: '静态分析老牌劲旅，坏味道提前拦截' },
  { id: 'stylelint.vscode-stylelint',       cat: 'quality', note: 'CSS/Less/SCSS 的 lint 标准答案' },
  { id: 'EditorConfig.EditorConfig',        cat: 'quality', note: '跨编辑器统一缩进风格，团队协作基础设施' },
  { id: 'snyk-security.snyk-vulnerability-scanner', cat: 'quality', note: '依赖与代码安全漏洞扫描，开源风险早暴露' },

  // ── 🌿 Git 协作 ───────────────────────────
  { id: 'eamodio.gitlens',                  cat: 'git', note: '行级 blame、提交历史、代码作者一目了然' },
  { id: 'mhutchie.git-graph',               cat: 'git', note: '可视化分支图谱，复杂合并也能看懂' },
  { id: 'github.vscode-pull-request-github', cat: 'git', note: '在编辑器里直接评审、合并 GitHub PR' },
  { id: 'donjayamanne.githistory',          cat: 'git', note: '文件级提交历史与 diff 速查' },
  { id: 'github.vscode-github-actions',     cat: 'git', note: '管理 GitHub Actions 工作流与运行状态' },
  { id: 'github.remotehub',                 cat: 'git', note: '免克隆直接浏览编辑 GitHub 仓库' },
  { id: 'vivaxy.vscode-conventional-commits', cat: 'git', note: 'Conventional Commits 表单化提交，规范不费心' },

  // ── 🎨 界面主题 ───────────────────────────
  { id: 'zhuangtongfa.material-theme',      cat: 'theme', note: 'One Dark Pro，最受欢迎的暗色主题之一' },
  { id: 'dracula-theme.theme-dracula',      cat: 'theme', note: '经典德古拉配色，跨工具统一审美' },
  { id: 'github.github-vscode-theme',       cat: 'theme', note: 'GitHub 官方主题，浅色深色都耐看' },
  { id: 'Catppuccin.catppuccin-vsc',        cat: 'theme', note: '柔和粉彩系配色，护眼又有质感' },
  { id: 'robbowen.synthwave-vscode',        cat: 'theme', note: 'SynthWave ’84：赛博朋克霓虹，梦回迈阿密' },
  { id: 'sainnhe.everforest',               cat: 'theme', note: '森林绿护眼配色，深夜写码好伙伴' },
  { id: 'arcticicestudio.nord-visual-studio-code', cat: 'theme', note: '极地冷色极简风，性冷淡美学巅峰' },
  { id: 'monokai.theme-monokai-pro-vscode', cat: 'theme', note: '老牌 Monokai 的专业复刻版' },
  { id: 'EliverLara.andromeda',             cat: 'theme', note: '深邃星空紫，颜值党直呼过瘾' },
  { id: 'PKief.material-icon-theme',        cat: 'theme', note: 'Material 图标包，文件类型一眼可辨' },
  { id: 'vscode-icons-team.vscode-icons',   cat: 'theme', note: '另一套经典文件图标，覆盖极全' },

  // ── 🐟 摸鱼炫技 ───────────────────────────
  { id: 'hoovercj.vscode-power-mode',       cat: 'fun', note: '打字喷火焰炸粒子，写代码也要有仪式感' },
  { id: 'giscafer.leek-fund',               cat: 'fun', note: '韭菜盒子：股票基金实时涨跌，摸鱼盯盘神器' },
  { id: 'adpyke.codesnap',                  cat: 'fun', note: '把代码截成高颜值图片，朋友圈技术博主上线' },
  { id: 'johnpapa.vscode-peacock',          cat: 'fun', note: '给每个工作区染上不同颜色，十个窗口不串台' },
  { id: 'WakaTime.vscode-wakatime',         cat: 'fun', note: '统计今天写了几小时代码，摸鱼时长无所遁形' },
  { id: 'softwaredotcom.swdc-vscode',       cat: 'fun', note: 'Code Time：生成你的编码数据年度报告' },
  { id: 'ms-vscode.vscode-speech',          cat: 'fun', note: '动动嘴皮子写代码，语音转文字输入' },

  // ── ⚡ 效率工具 ───────────────────────────
  { id: 'formulahendry.code-runner',        cat: 'tools', note: '一键运行 40+ 种语言代码片段' },
  { id: 'ritwickdey.liveserver',            cat: 'tools', note: '本地静态服务器，保存自动刷新页面' },
  { id: 'christian-kohler.path-intellisense', cat: 'tools', note: '文件路径自动补全，import 不再凭记忆' },
  { id: 'formulahendry.auto-rename-tag',    cat: 'tools', note: '改开标签自动同步闭合标签' },
  { id: 'gruntfuggly.todo-tree',            cat: 'tools', note: '汇总全项目 TODO，待办不再散落各处' },
  { id: 'alefragnani.bookmarks',            cat: 'tools', note: '给代码行打书签，大文件跳转利器' },
  { id: 'oderwat.indent-rainbow',           cat: 'tools', note: '缩进彩虹着色，层级深浅秒读' },
  { id: 'wix.vscode-import-cost',           cat: 'tools', note: '行内显示 import 包体积，性能心中有数' },
  { id: 'pflannery.vscode-versionlens',     cat: 'tools', note: '依赖版本一目了然，一键升级最新版' },
  { id: 'christian-kohler.npm-intellisense', cat: 'tools', note: 'npm 包名自动补全，require 更顺手' },
  { id: 'wayou.vscode-todo-highlight',      cat: 'tools', note: 'TODO/FIXME 醒目高亮，再也不怕漏看' },
  { id: 'tyriar.sort-lines',                cat: 'tools', note: '选中行一键排序，整理依赖声明超爽' },
  { id: 'mkxml.vscode-filesize',            cat: 'tools', note: '状态栏常驻当前文件大小' },
  { id: 'wmaurer.change-case',              cat: 'tools', note: '驼峰、蛇形、全大写…命名风格秒切换' },
  { id: 'obkoro1.korofileheader',           cat: 'tools', note: '一键生成文件头注释，还能画 ASCII 艺术字' },
  { id: 'quicktype.quicktype',              cat: 'tools', note: '粘贴 JSON 直接生成类型定义，魔法般体验' },

  // ── 🖥️ 前端开发 ───────────────────────────
  { id: 'dsznajder.es7-react-js-snippets',  cat: 'frontend', note: 'React/Redux 高频代码片段合集' },
  { id: 'bradlc.vscode-tailwindcss',        cat: 'frontend', note: 'Tailwind 类名智能提示与悬停预览' },
  { id: 'styled-components.vscode-styled-components', cat: 'frontend', note: 'CSS-in-JS 语法高亮与补全' },
  { id: 'mgmcdermott.vscode-language-babel', cat: 'frontend', note: '现代 JSX/ES2015+ 语法高亮支持' },
  { id: 'ecmel.vscode-html-css',            cat: 'frontend', note: 'HTML 中 CSS id/class 补全与跳转' },
  { id: 'pranaygp.vscode-css-peek',         cat: 'frontend', note: '从 HTML 一键跳转到 CSS 定义' },
  { id: 'vincaslt.highlight-matching-tag',  cat: 'frontend', note: '成对标签配对高亮，嵌套再深也不晕' },
  { id: 'astro-build.astro-vscode',         cat: 'frontend', note: 'Astro 官方支持，岛屿架构开发必备' },
  { id: 'biomejs.biome',                    cat: 'frontend', note: 'Rust 写的超快 linter+formatter 二合一' },
  { id: 'GraphQL.vscode-graphql',           cat: 'frontend', note: 'GraphQL 语法、补全与 schema 校验' },
  { id: 'Prisma.prisma',                    cat: 'frontend', note: 'Prisma ORM 官方支持，schema 高亮补全' },
  { id: 'ms-edgedevtools.vscode-edge-devtools', cat: 'frontend', note: '编辑器内置浏览器 DevTools，调样式不用切窗' },
  { id: 'antfu.unocss',                     cat: 'frontend', note: 'UnoCSS 原子化引擎官方支持，Antfu 出品' },
  { id: 'antfu.iconify',                    cat: 'frontend', note: 'Iconify 十几万图标即搜即用，行内预览' },

  // ── 📦 远程容器 ───────────────────────────
  { id: 'ms-vscode-remote.remote-ssh',      cat: 'remote', note: 'SSH 直连服务器开发，像在本地一样流畅' },
  { id: 'ms-vscode-remote.remote-wsl',      cat: 'remote', note: 'Windows 下无缝使用 Linux 工具链' },
  { id: 'ms-vscode-remote.remote-containers', cat: 'remote', note: '开发环境装进容器，团队环境零差异' },
  { id: 'ms-azuretools.vscode-docker',      cat: 'remote', note: '镜像、容器、Compose 一站式管理' },
  { id: 'ms-kubernetes-tools.vscode-kubernetes-tools', cat: 'remote', note: 'K8s 集群资源可视化与 YAML 智能提示' },
  { id: 'ms-vscode-remote.vscode-remote-extensionpack', cat: 'remote', note: '远程开发全家桶，SSH/WSL/容器打包带走' },

  // ── 🤖 AI 编程 ────────────────────────────
  { id: 'github.copilot',                   cat: 'ai', note: 'GitHub 官方 AI 结对程序员，补全质量标杆' },
  { id: 'github.copilot-chat',              cat: 'ai', note: 'Copilot 聊天助手，解释代码、生成测试' },
  { id: 'Continue.continue',                cat: 'ai', note: '开源 AI 助手，可接任意模型自由定制' },
  { id: 'saoudrizwan.claude-dev',           cat: 'ai', note: 'Cline：自主执行任务的 AI 编程代理' },
  { id: 'rooveterinaryinc.roo-cline',       cat: 'ai', note: 'Roo Code：Cline 增强分支，模式更丰富' },
  { id: 'Google.geminicodeassist',          cat: 'ai', note: '谷歌 AI 助手，个人版免费额度慷慨' },
  { id: 'amazonwebservices.amazon-q-vscode', cat: 'ai', note: '亚马逊 AI 助手，AWS 场景加成明显' },
  { id: 'Codeium.codeium',                  cat: 'ai', note: 'Windsurf 插件（原 Codeium），免费补全够用' },
  { id: 'supermaven.supermaven',            cat: 'ai', note: '百万 token 上下文，补全速度一绝' },
  { id: 'VisualStudioExptTeam.vscodeintellicode', cat: 'ai', note: '微软智能感知补全，老牌 AI 选手' },

  // ── 🗄️ 数据接口 ───────────────────────────
  { id: 'humao.rest-client',                cat: 'data', note: '在 .http 文件里直接发请求，API 调试神器' },
  { id: 'rangav.vscode-thunder-client',     cat: 'data', note: '轻量版 Postman，接口测试不离编辑器' },
  { id: 'cweijan.vscode-mysql-client2',     cat: 'data', note: '数据库客户端，MySQL/Redis/SSH 全支持' },
  { id: 'ms-mssql.mssql',                   cat: 'data', note: 'SQL Server 官方工具，查询与管理兼备' },
  { id: 'mongodb.mongodb-vscode',           cat: 'data', note: 'MongoDB 官方连接与 Playground' },
  { id: 'mtxr.sqltools',                    cat: 'data', note: '多数据库 SQL 工作台，驱动生态丰富' },
  { id: 'mechatroner.rainbow-csv',          cat: 'data', note: 'CSV 列彩虹高亮，还能跑 SQL 查询' },
  { id: 'janisdd.vscode-edit-csv',          cat: 'data', note: '像 Excel 一样表格化编辑 CSV' },
  { id: 'qwtel.sqlite-viewer',              cat: 'data', note: '免装客户端直接浏览 SQLite 数据库' },
  { id: 'GrapeCity.gc-excelviewer',         cat: 'data', note: 'Excel 文件直接预览，不用开 Office' },
  { id: 'ms-toolsai.jupyter',               cat: 'data', note: '在 VS Code 里跑 Jupyter Notebook' },
  { id: 'ms-toolsai.datawrangler',          cat: 'data', note: '数据清洗可视化，pandas 代码自动生成' },
  { id: 'ms-vscode.hexeditor',              cat: 'data', note: '十六进制查看编辑二进制文件' },
  { id: '42crunch.vscode-openapi',          cat: 'data', note: 'OpenAPI/Swagger 编辑器，接口设计先行' },

  // ── 📝 文档写作 ───────────────────────────
  { id: 'yzhang.markdown-all-in-one',       cat: 'docs', note: 'Markdown 全能工具箱：快捷键、目录、预览' },
  { id: 'shd101wyy.markdown-preview-enhanced', cat: 'docs', note: '增强预览，支持图表、数学公式渲染' },
  { id: 'bierner.markdown-mermaid',         cat: 'docs', note: 'Markdown 里直接渲染 Mermaid 流程图' },
  { id: 'davidanson.vscode-markdownlint',   cat: 'docs', note: 'Markdown 风格检查，文档规范好帮手' },
  { id: 'hediet.vscode-drawio',             cat: 'docs', note: '编辑器内画架构图，图随代码进版本库' },
  { id: 'mushan.vscode-paste-image',        cat: 'docs', note: '截图直接粘贴进 Markdown，自动存图' },
  { id: 'yzane.markdown-pdf',               cat: 'docs', note: 'Markdown 一键导出 PDF/HTML' },
  { id: 'unifiedjs.vscode-mdx',             cat: 'docs', note: 'MDX 支持：Markdown 里写 JSX 组件' },
  { id: 'bierner.emojisense',               cat: 'docs', note: '输入冒号自动补全 emoji 😄' },
  { id: 'antfu.slidev',                     cat: 'docs', note: 'Slidev：用 Markdown 写程序员专属幻灯片' },
  { id: 'pomdtr.excalidraw-editor',         cat: 'docs', note: 'Excalidraw 手绘白板，随笔架构图直接入库' },

  // ── 🔬 调试可视 ───────────────────────────
  { id: 'hediet.debug-visualizer',          cat: 'debug', note: '调试时把数据结构画成图，算法党狂喜' },
  { id: 'wallabyjs.quokka-vscode',          cat: 'debug', note: '边写边看每行运行结果，JS 草稿纸' },
  { id: 'orta.vscode-jest',                 cat: 'debug', note: 'Jest 测试行内显示通过/失败' },
  { id: 'firsttris.vscode-jest-runner',     cat: 'debug', note: '单个用例一键运行/调试' },
  { id: 'vitest.explorer',                  cat: 'debug', note: 'Vitest 官方测试面板' },
  { id: 'vadimcn.vscode-lldb',              cat: 'debug', note: 'CodeLLDB：Rust/C++/原生代码调试利器' },
  { id: 'kisstkondoros.vscode-codemetrics', cat: 'debug', note: '函数圈复杂度实时可见，重构信号灯' },
  { id: 'ms-playwright.playwright',         cat: 'debug', note: 'Playwright 官方：端到端测试录制调试一体' },

  // ── 📖 阅读翻译 ───────────────────────────
  { id: 'intellsmi.comment-translate',      cat: 'read', note: '悬停翻译英文注释，读开源源码神器' },
  { id: 'funkyremi.vscode-google-translate', cat: 'read', note: '划词即译，文档阅读零障碍' },
  { id: 'tomoki1207.pdf',                   cat: 'read', note: 'VS Code 里直接看 PDF 论文文档' },
  { id: 'kisstkondoros.vscode-gutter-preview', cat: 'read', note: '代码里引用的图片行号旁直接预览' },
  { id: 'ibm.output-colorizer',             cat: 'read', note: '给日志输出着色，报错警告秒识别' },

  // ── 🛠️ 工程配置 ───────────────────────────
  { id: 'hashicorp.terraform',              cat: 'devops', note: 'Terraform 官方支持，IaC 语法补全' },
  { id: 'redhat.vscode-yaml',               cat: 'devops', note: 'YAML schema 校验，K8s 清单好搭档' },
  { id: 'tamasfe.even-better-toml',         cat: 'devops', note: 'TOML 高亮补全，Cargo.toml 好帮手' },
  { id: 'mikestead.dotenv',                 cat: 'devops', note: '.env 环境变量文件高亮' },
  { id: 'ms-azuretools.vscode-azurefunctions', cat: 'devops', note: 'Azure Functions 创建部署调试一条龙' },
  { id: 'hangxingliu.vscode-nginx-conf-hint', cat: 'devops', note: 'nginx.conf 语法提示与文档速查' },
  { id: 'ms-vscode.cmake-tools',            cat: 'devops', note: 'CMake 项目配置构建调试全流程' },
];
