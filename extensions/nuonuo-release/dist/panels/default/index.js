'use strict';

/**
 * nuonuo-release 面板。
 *
 * 模板和样式直接内联成字符串，不读 static 目录 —— 面板脚本的 __dirname 在打包后的
 * 编辑器里不一定还指向扩展目录，内联可以彻底绕开相对路径问题。
 *
 * 数据流：**只有一条路径 —— 轮询主进程的 `get-state`**（任务在跑时 700ms 一次，
 * 空闲时停）。不用 broadcast：面板关掉再打开就没有历史，而轮询天然能补全，
 * 一条路径比「broadcast 增量 + getState 补历史」两条好维护。
 *
 * 注意所有消息名（`get-state` / `probe-env` / …）都必须在 package.json 的
 * `contributions.messages` 里注册过才可达 —— 没注册的话 request 会被拒，
 * 面板上看到的就是「和主进程通信失败」。
 */

const PKG = 'nuonuo-release';

const HTML = `
<div class="root">
    <section class="card">
        <div class="card-head">
            <span class="card-title">环境</span>
            <span class="head-actions">
                <button class="mini" id="btn-open-dir">打开产物文件夹</button>
                <button class="mini" id="btn-refresh">重新检测</button>
            </span>
        </div>
        <div class="env-row">
            <span class="dot" id="dot-devtools"></span>
            <span class="env-label">开发者工具</span>
            <span class="env-value" id="val-devtools">检测中…</span>
        </div>
        <div class="env-row">
            <span class="dot" id="dot-port"></span>
            <span class="env-label">服务端口</span>
            <span class="env-value" id="val-port">检测中…</span>
        </div>
        <div class="env-row">
            <span class="dot" id="dot-build"></span>
            <span class="env-label">构建产物</span>
            <span class="env-value" id="val-build">检测中…</span>
        </div>
        <div class="env-row">
            <span class="dot" id="dot-plan"></span>
            <span class="env-label">构建参数</span>
            <span class="env-value" id="val-plan">检测中…</span>
        </div>
        <div class="env-row">
            <span class="dot dot-grey"></span>
            <span class="env-label">AppID</span>
            <span class="env-value" id="val-appid">-</span>
        </div>
        <div class="hint warn" id="hint-port" style="display:none"></div>
    </section>

    <section class="card">
        <div class="card-title">版本</div>
        <div class="field">
            <label class="field-label" for="in-version">版本号</label>
            <input class="text" id="in-version" type="text" placeholder="1.0.0" spellcheck="false" />
            <div class="hint" id="hint-version">格式：数字.数字.数字</div>
        </div>
        <div class="field">
            <label class="field-label" for="in-desc">版本描述</label>
            <textarea class="text area" id="in-desc" rows="2" placeholder="这次改了什么（留空则自动填 release 版本号）"></textarea>
        </div>
    </section>

    <section class="card">
        <div class="card-title">选项</div>
        <label class="check"><input type="checkbox" id="ck-skip-build" /><span>跳过构建，直接上传现有产物</span></label>
        <label class="check"><input type="checkbox" id="ck-build-only" /><span>只构建，不上传</span></label>
        <label class="check"><input type="checkbox" id="ck-allow-port" /><span>允许自动开启服务端口</span></label>
        <div class="hint" id="hint-allow-port">服务端口属于开发者工具的安全设置，默认不替你改。勾上后上传时若检测到未开启，会让 CLI 自行拉起。</div>
    </section>

    <div class="actions">
        <button class="primary" id="btn-run">构建并上传</button>
        <span class="status" id="status"></span>
    </div>

    <section class="card grow">
        <div class="card-head">
            <span class="card-title">日志</span>
            <button class="mini" id="btn-clear">清空面板</button>
        </div>
        <div class="log" id="log"></div>
    </section>
</div>
`;

const CSS = `
.root {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    font-size: 12px;
    color: var(--color-normal-contrast-weakest, #ccc);
}
.card {
    background: var(--color-normal-fill, #2b2b2b);
    border: 1px solid var(--color-normal-border, #3a3a3a);
    border-radius: 4px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.card.grow { flex: 1; min-height: 140px; }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.head-actions { display: flex; align-items: center; gap: 4px; }
.card-title { font-weight: 600; opacity: .9; }
.env-row { display: flex; align-items: baseline; gap: 6px; }
.dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #888; flex: none; align-self: center;
}
.dot-green { background: #4caf50; }
.dot-red { background: #e05252; }
.dot-grey { background: #666; }
.env-label { flex: none; width: 76px; opacity: .7; }
.env-value {
    flex: 1; min-width: 0;
    word-break: break-all;
    font-family: Consolas, Menlo, monospace;
    font-size: 11px;
    opacity: .95;
}
.field { display: flex; flex-direction: column; gap: 4px; }
.field-label { opacity: .7; }
.text {
    width: 100%; box-sizing: border-box;
    background: var(--color-normal-fill-important, #1e1e1e);
    border: 1px solid var(--color-normal-border, #3a3a3a);
    border-radius: 3px;
    color: inherit; font-family: inherit; font-size: 12px;
    padding: 4px 6px;
    outline: none;
}
.text:focus { border-color: var(--color-focus-border, #4a90d9); }
.area { resize: vertical; min-height: 40px; font-family: inherit; }
.hint { font-size: 11px; opacity: .55; line-height: 1.45; }
.hint.warn { color: #e8a33d; opacity: .95; }
.check { display: flex; align-items: center; gap: 6px; cursor: pointer; }
.check input { margin: 0; cursor: pointer; }
.actions { display: flex; align-items: center; gap: 8px; }
button {
    font-family: inherit; font-size: 12px;
    border-radius: 3px; cursor: pointer;
    border: 1px solid var(--color-normal-border, #3a3a3a);
    background: var(--color-normal-fill, #2b2b2b);
    color: inherit;
    padding: 5px 10px;
}
button:hover:not(:disabled) { border-color: var(--color-focus-border, #4a90d9); }
button:disabled { opacity: .45; cursor: not-allowed; }
button.primary {
    background: #3a6ea5; border-color: #3a6ea5; color: #fff;
    padding: 6px 16px; font-weight: 600;
}
button.primary:hover:not(:disabled) { background: #4580bd; }
button.mini { padding: 2px 8px; font-size: 11px; opacity: .8; }
.status { font-size: 11px; opacity: .75; }
.log {
    flex: 1; min-height: 100px;
    overflow-y: auto;
    background: #161616;
    border-radius: 3px;
    padding: 6px 8px;
    font-family: Consolas, Menlo, monospace;
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-all;
}
.log .l-err { color: #e05252; }
.log .l-ok { color: #4caf50; }
.log .l-dim { opacity: .5; }
`;

/** 面板脚本的 $ 映射：key 就是 this.$.xxx */
const $ = {
    btnRefresh: '#btn-refresh',
    btnOpenDir: '#btn-open-dir',
    btnRun: '#btn-run',
    btnClear: '#btn-clear',

    dotDevtools: '#dot-devtools',
    dotPort: '#dot-port',
    dotBuild: '#dot-build',
    dotPlan: '#dot-plan',
    valDevtools: '#val-devtools',
    valPort: '#val-port',
    valBuild: '#val-build',
    valPlan: '#val-plan',
    valAppid: '#val-appid',
    hintPort: '#hint-port',

    inVersion: '#in-version',
    inDesc: '#in-desc',
    hintVersion: '#hint-version',

    ckSkipBuild: '#ck-skip-build',
    ckBuildOnly: '#ck-build-only',
    ckAllowPort: '#ck-allow-port',
    hintAllowPort: '#hint-allow-port',

    status: '#status',
    log: '#log',
};

module.exports = Editor.Panel.define({
    template: HTML,
    style: CSS,
    $,

    methods: {
        // ---------------------------------------------------------- 渲染

        _setEnvRow(dotKey, cls, text) {
            const dot = this.$[dotKey];
            if (dot) dot.className = `dot ${cls}`;
            return text;
        },

        renderEnv(env, plan) {
            if (!env) return;

            const $d = this.$;
            if (plan) {
                if ($d.valPlan) {
                    $d.valPlan.textContent = plan.ok
                        ? `wechatgame → ${plan.buildPath}/${plan.outputName}（${plan.sceneCount} 个场景）`
                        : (plan.message || '不可用');
                }
                this._setEnvRow('dotPlan', plan.ok ? 'dot-green' : 'dot-red');
            }

            if ($d.valDevtools) {
                $d.valDevtools.textContent = env.devtoolsOk
                    ? env.devtoolsDir
                    : (env.devtoolsHint || '未找到');
            }
            this._setEnvRow('dotDevtools', env.devtoolsOk ? 'dot-green' : 'dot-red');

            if ($d.valPort) {
                $d.valPort.textContent = env.servicePort ? '已开启' : (env.servicePortHint || '未开启');
            }
            this._setEnvRow('dotPort', env.servicePort ? 'dot-green' : 'dot-red');

            if ($d.valBuild) {
                $d.valBuild.textContent = env.buildExists ? env.buildDir : '还没有构建产物';
            }
            this._setEnvRow('dotBuild', env.buildExists ? 'dot-green' : 'dot-grey');

            if ($d.valAppid) $d.valAppid.textContent = env.appid || '-';

            // 端口没开而且没勾「允许自动开启」时给一条明确的橙色提示
            const allow = !!($d.ckAllowPort && $d.ckAllowPort.checked);
            if ($d.hintPort) {
                if (!env.servicePort && !allow) {
                    $d.hintPort.textContent = `服务端口未开启：${env.servicePortHint || '请到开发者工具的「设置 → 安全设置」里打开'}`;
                    $d.hintPort.style.display = '';
                } else {
                    $d.hintPort.style.display = 'none';
                }
            }
        },

        renderBusy(busy, phase, message, progress) {
            const $d = this.$;
            if ($d.btnRun) $d.btnRun.disabled = !!busy;
            if ($d.btnRefresh) $d.btnRefresh.disabled = !!busy;
            // 收工时**不清** status：让它停在最后那句结果上（「已上传 1.0.1」之类），
            // 不然主进程 done 的那次广播会把刚写上的成功提示又抹掉。清空由 run() 开头负责。
            if ($d.status && busy) {
                const pct = typeof progress === 'number' && progress > 0
                    ? ` ${Math.round(progress * 100)}%`
                    : '';
                $d.status.textContent = `${message || phase || '处理中'}${pct}`;
            }
        },

        appendLog(text, cls) {
            const box = this.$ && this.$['log'];
            if (!box) return;
            const nodes = String(text == null ? '' : text).split(/\r?\n/);
            for (const one of nodes) {
                const line = document.createElement('div');
                if (cls) line.className = cls;
                line.textContent = one;
                box.appendChild(line);
            }
            while (box.childNodes.length > 1200) box.removeChild(box.firstChild);
            box.scrollTop = box.scrollHeight;
        },

        /**
         * 只清界面，**不动 _logSeq**：日志的真身在主进程，重置序号的话下次轮询
         * 会把刚清掉的内容原样再拉回来。
         */
        clearLog() {
            const box = this.$ && this.$.log;
            if (box) box.innerHTML = '';
        },

        /**
         * 增量渲染日志。
         *
         * 不能用「数组长度」判断新增了多少行：主进程那边的环形缓冲满了之后会 shift()，
         * length 就卡在 MAX_LOG_LINES 不再增长，按长度比对会永远追加不上。
         * 所以主进程给了一个只增不减的 logSeq，这里按序号差取尾部。
         */
        renderLogs(lines, runId, logSeq) {
            const box = this.$ && this.$.log;
            if (!box || !Array.isArray(lines)) return;

            if (runId !== this._logRunId) {
                // 新的一轮，从头来
                this._logRunId = runId;
                this._logSeq = 0;
                box.innerHTML = '';
            }

            const seq = typeof logSeq === 'number' ? logSeq : lines.length;
            let fresh = seq - this._logSeq;
            if (fresh <= 0) return;

            let start = 0;
            if (fresh > lines.length) {
                // 面板落后太多，缓冲里最早的那些已经被挤掉了，能拿多少拿多少
                fresh = lines.length;
            } else {
                start = lines.length - fresh;
            }

            for (let i = start; i < lines.length; i += 1) {
                const line = document.createElement('div');
                line.textContent = lines[i];
                box.appendChild(line);
            }
            this._logSeq = seq;

            while (box.childNodes.length > 1200) box.removeChild(box.firstChild);
            box.scrollTop = box.scrollHeight;
        },

        /** 把主进程返回的 state 渲染到界面 */
        renderState(st) {
            if (!st) return;
            this.renderLogs(st.logs, st.runId, st.logSeq);

            // 面板自己的 _busy 和主进程的 running 任一为真都算忙
            // （重开面板时 _busy 是 false，但主进程可能还在跑）
            const busy = !!(this._busy || st.running);
            this.renderBusy(busy, st.phase, st.message, st.progress);

            if (!busy && st.phase === 'done' && st.lastResult && this.$.status) {
                this.$.status.textContent = st.lastResult.message || '';
            }

            if (st.running) this._startPolling();
            else this._stopPolling();
        },

        // ---------------------------------------------------------- 轮询

        _startPolling() {
            if (this._timer) return;
            this._timer = setInterval(() => this.poll(false), 700);
        },

        _stopPolling() {
            if (!this._timer) return;
            clearInterval(this._timer);
            this._timer = null;
        },

        /** @param {boolean} first 是否连「环境 / 上次版本号」一起初始化 */
        poll(first) {
            return Editor.Message.request(PKG, 'get-state', {}).then((res) => {
                if (!res) return;

                if (first) {
                    this.renderEnv(res.env, res.buildPlan);

                    const s = res.settings || {};
                    if (this.$.inVersion && !this.$.inVersion.value) {
                        // 从没发过版时给个 1.0.0 当起点，省得对着空框发呆
                        this.$.inVersion.value = s.lastVersion || '1.0.0';
                    }
                    if (this.$.inDesc && !this.$.inDesc.value) {
                        this.$.inDesc.value = s.lastDesc || '';
                    }
                    if (this.$.hintVersion && s.lastUploadedVersion) {
                        this.$.hintVersion.textContent = `上次上传：${s.lastUploadedVersion}；格式：数字.数字.数字`;
                    }

                    this.applyChecks(s);
                }

                this.renderState(res.state);
            }).catch((err) => {
                this._stopPolling();
                const msg = `和主进程通信失败：${err && err.message ? err.message : err}`;
                this.appendLog(msg, 'l-err');
                if (this.$.status) this.$.status.textContent = msg;
            });
        },

        // ---------------------------------------------------------- 勾选框

        /**
         * 勾选框的状态存到本机（profiles/nuonuo-release.json），下次打开面板原样恢复。
         * 三个一起发：跳过构建 / 只构建是互斥的，只发一个可能把另一个改脏。
         *
         * 注意：这里给 checkbox 赋 .checked 不会触发 change 事件，
         * 所以恢复时不会反过来再写一次存档。
         */
        saveChecks() {
            const $d = this.$;
            return Editor.Message.request(PKG, 'remember-settings', {
                skipBuild: !!($d.ckSkipBuild && $d.ckSkipBuild.checked),
                buildOnly: !!($d.ckBuildOnly && $d.ckBuildOnly.checked),
                allowEnablePort: !!($d.ckAllowPort && $d.ckAllowPort.checked),
            }).catch(() => {});
        },

        applyChecks(s) {
            if (!s) return;
            const $d = this.$;
            if ($d.ckSkipBuild) $d.ckSkipBuild.checked = !!s.skipBuild;
            if ($d.ckBuildOnly) $d.ckBuildOnly.checked = !!s.buildOnly;
            if ($d.ckAllowPort) $d.ckAllowPort.checked = !!s.allowEnablePort;
        },

        // ---------------------------------------------------------- 交互

        async openBuildDir() {
            try {
                const r = await Editor.Message.request(PKG, 'open-build-dir', {});
                if (r && r.ok === false) {
                    this.appendLog(r.message + (r.hint ? `（${r.hint}）` : ''), 'l-err');
                }
            } catch (err) {
                this.appendLog(`打开产物文件夹失败：${err && err.message ? err.message : err}`, 'l-err');
            }
        },

        async refreshEnv() {
            try {
                const res = await Editor.Message.request(PKG, 'probe-env', {});
                this.renderEnv(res && res.env, res && res.buildPlan);
            } catch (err) {
                this.appendLog(`检测环境失败：${err && err.message ? err.message : err}`, 'l-err');
            }
        },

        collect() {
            const $d = this.$;
            return {
                version: ($d.inVersion && $d.inVersion.value || '').trim(),
                desc: ($d.inDesc && $d.inDesc.value || '').trim(),
                skipBuild: !!($d.ckSkipBuild && $d.ckSkipBuild.checked),
                buildOnly: !!($d.ckBuildOnly && $d.ckBuildOnly.checked),
                allowEnablePort: !!($d.ckAllowPort && $d.ckAllowPort.checked),
            };
        },

        fail(message) {
            this.clearLog();
            this.appendLog(message, 'l-err');
            if (this.$.status) this.$.status.textContent = message;
        },

        async run() {
            if (this._busy) return;

            const opts = this.collect();

            // 只有「只构建」不需要版本号，其余两种都要上传
            if (!opts.buildOnly && !/^\d+\.\d+\.\d+$/.test(opts.version)) {
                this.fail(`版本号要写成 1.0.0 这样，现在是「${opts.version || '空'}」`);
                return;
            }

            this._busy = true;
            this.clearLog();
            if (this.$.status) this.$.status.textContent = '';
            this.renderBusy(true, 'building', opts.buildOnly ? '构建中' : '准备中', 0);
            this._startPolling();

            // 手填的版本号/描述先落盘，下次打开面板能带出来
            Editor.Message.request(PKG, 'remember-settings', {
                version: opts.version,
                desc: opts.desc,
            }).catch(() => {});

            // 只写状态行，不往日志里塞 —— 这些内容主进程自己也记了一份，
            // 轮询会把它拉回来，这里再写一遍就是重复行。
            const say = (text) => {
                if (this.$.status) this.$.status.textContent = text;
            };

            try {
                if (opts.buildOnly) {
                    const r = await Editor.Message.request(PKG, 'build-only', {});
                    if (r && r.ok === false) say(r.message);
                    else say('构建完成');
                } else {
                    const r = await Editor.Message.request(PKG, 'build-and-upload', {
                        version: opts.version,
                        desc: opts.desc,
                        skipBuild: opts.skipBuild,
                        allowEnablePort: opts.allowEnablePort,
                    });
                    if (r && r.ok === false) say(r.message);
                    else say(`已上传 ${opts.version}`);
                    this.refreshEnv();
                }
            } catch (err) {
                say(`调用失败：${err && err.message ? err.message : err}`);
            } finally {
                this._busy = false;
                this.renderBusy(false);
            }
        },
    },

    ready() {
        this._busy = false;

        // ---- 事件绑定
        const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

        on(this.$.btnRefresh, 'click', () => this.refreshEnv());
        on(this.$.btnOpenDir, 'click', () => this.openBuildDir());
        on(this.$.btnRun, 'click', () => this.run());
        on(this.$.btnClear, 'click', () => this.clearLog());

        on(this.$.ckSkipBuild, 'change', () => {
            if (this.$.ckSkipBuild.checked && this.$.ckBuildOnly) this.$.ckBuildOnly.checked = false;
            this.saveChecks();
        });
        on(this.$.ckBuildOnly, 'change', () => {
            if (this.$.ckBuildOnly.checked && this.$.ckSkipBuild) this.$.ckSkipBuild.checked = false;
            this.saveChecks();
        });
        on(this.$.ckAllowPort, 'change', () => {
            this.saveChecks();
            this.refreshEnv();
        });

        on(this.$.inVersion, 'change', () => {
            const v = (this.$.inVersion.value || '').trim();
            Editor.Message.request(PKG, 'remember-settings', { version: v }).catch(() => {});
        });

        // ---- 首次全量拉取：环境 + 上次版本号 / 描述 + 日志历史
        this.poll(true);
    },

    beforeClose() {
        // 任务在主进程里跑，关掉面板不会中断它（state.logs 还在，重开面板能捞回来），
        // 这里只是提醒一句，不拦。
        if (this._busy) {
            console.warn('[nuonuo-release] 面板关闭，任务仍在主进程继续');
        }
        this._stopPolling();
        return true;
    },

    close() {
        this._stopPolling();
    },
});
