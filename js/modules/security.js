/**
 * 模块五：安全与可观测性
 * 4 个挑战：认证链、RBAC 权限、SecurityContext、可观测性三大支柱
 */
window.K8sModules = window.K8sModules || {};

window.K8sModules['security'] = {
  id: 'security',
  description: '理解 K8s 安全机制和可观测性三大支柱。',

  challenges: [
    {
      title: '请求安全链',
      type: 'decision',
      description: '一个访问 K8s API 的请求需要通过三道安全关卡。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('请求安全链路', engine.width / 2, 25, {
          color: '#faf9f5', fontSize: 16, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        const stages = [
          {
            id: 'auth',
            label: '认证（Authentication）',
            x: 65, y: 80, w: 190, h: 80,
            color: '#7c9a5e',
            hint: '验证请求者身份。K8s 支持 Token、证书、OIDC 等认证方式，ServiceAccount 使用 JWT Token。'
          },
          {
            id: 'authz',
            label: '授权（Authorization）',
            x: 305, y: 80, w: 190, h: 80,
            color: '#c96442',
            hint: '认证通过后，验证该身份是否具有操作权限。K8s 支持 ABAC、RBAC、Webhook、Node 四种模式，默认使用 RBAC。'
          },
          {
            id: 'admission',
            label: '准入控制（Admission）',
            x: 545, y: 80, w: 190, h: 80,
            color: '#a08bb5',
            hint: 'MutatingWebhook 可修改请求内容，ValidatingWebhook 用于校验策略合规性。'
          }
        ];

        stages.forEach(stage => {
          engine.drawNode(stage.x, stage.y, stage.w, stage.h, stage.label, {
            id: stage.id, borderColor: stage.color, bgColor: stage.color + '11',
            interactive: true, data: stage
          });
        });

        engine.drawArrow(255, 120, 305, 120, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(495, 120, 545, 120, { color: '#5e5d59', dashed: [3, 3] });

        engine.drawRect(60, 200, 760, 100, {
          fillColor: '#30302e', borderColor: '#5e5d59', radius: 8
        });
        engine.drawText('安全链路说明：', 80, 215, { color: '#d97757', fontSize: 12, fontWeight: '600' });
        engine.drawText('1. 认证（AuthN）：确认你是谁', 80, 240, { color: '#87867f', fontSize: 11 });
        engine.drawText('2. 授权（AuthZ）：确认你能做什么', 80, 260, { color: '#87867f', fontSize: 11 });
        engine.drawText('3. 准入控制：修改或验证请求', 80, 280, { color: '#87867f', fontSize: 11 });

        engine.drawText('👆 点击每个阶段查看详情', engine.width / 2, engine.height - 40, {
          color: '#5e5d59', fontSize: 13, align: 'center', baseline: 'middle'
        });

        let explored = new Set();
        const stageIds = stages.map(s => s.id);

        interactions.onClick(stageIds, (id, data, pos) => {
          app.showTooltip(data.label, data.hint, pos.x + 10, pos.y - 20);
          animations.emitParticles(engine, pos.x, pos.y, data.color, 8);
          explored.add(id);
          if (explored.size >= stages.length) {
            app.showFeedback('success', '完成安全链路探索：认证 → 授权 → 准入控制！', 1500);
            setTimeout(() => app.onChallengeComplete('security', 0, false), 1500);
          }
        });

        interactions.onAnyClick((hit) => {
          if (!hit) app.hideTooltip();
        });
      }
    },
    {
      title: 'RBAC 权限配置',
      type: 'choice',
      description: '为开发者 ServiceAccount 配置最小权限：仅在 default 命名空间中读取 Pod。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('RBAC 权限配置', engine.width / 2, 25, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawNode(60, 60, 200, 50, '开发者 SA', {
          borderColor: '#d97757', bgColor: '#d9775711'
        });
        engine.drawArrow(160, 110, 160, 140, { color: '#5e5d59' });

        engine.drawRect(60, 140, 200, 60, {
          fillColor: '#a08bb511', borderColor: '#a08bb5', radius: 8
        });
        engine.drawText('default 命名空间', 160, 160, {
          color: '#a08bb5', fontSize: 11, align: 'center', baseline: 'middle'
        });

        engine.drawText('目标：仅读取 Pod', 380, 70, { color: '#87867f', fontSize: 12, align: 'center' });

        const podNode = { id: 'pods', label: 'Pods', x: 380, y: 100, w: 140, h: 50, color: '#7c9a5e' };
        engine.drawNode(podNode.x, podNode.y, podNode.w, podNode.h, podNode.label, {
          borderColor: podNode.color, bgColor: podNode.color + '11'
        });

        engine.drawRect(300, 180, 300, 100, {
          fillColor: '#30302e', borderColor: '#5e5d59', radius: 8
        });
        engine.drawText('权限要求：', 320, 195, { color: '#c96442', fontSize: 12, fontWeight: '600' });
        engine.drawText('1. 只读权限（get、list、watch）', 320, 215, { color: '#87867f', fontSize: 11 });
        engine.drawText('2. 仅限 default 命名空间', 320, 235, { color: '#87867f', fontSize: 11 });
        engine.drawText('3. 仅限 Pod 资源', 320, 255, { color: '#87867f', fontSize: 11 });

        interactions.enableChoice(
          [
            { id: 'wrong1', label: 'ClusterRole + ClusterRoleBinding', desc: '集群级别权限，范围过大' },
            { id: 'correct', label: 'Role + RoleBinding', desc: '正确：命名空间级别权限' },
            { id: 'wrong2', label: '赋予 admin ClusterRole', desc: '违反最小权限原则' }
          ],
          'correct',
          (correct) => {
            if (correct) {
              app.showFeedback('success', '正确！Role + RoleBinding 遵循最小权限原则，仅在目标命名空间内授权。', 1500);
              animations.emitParticles(engine, 450, 125, '#7c9a5e', 15);
              setTimeout(() => app.onChallengeComplete('security', 1, false), 2000);
            } else {
              app.showFeedback('error', '不正确！应使用 Role 而非 ClusterRole，遵循最小权限原则。', 1500);
            }
          }
        );
      }
    },
    {
      title: 'SecurityContext 配置',
      type: 'choice',
      description: '配置 SecurityContext 增强容器安全性。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('SecurityContext 安全上下文', engine.width / 2, 25, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawRect(60, 60, 280, 140, {
          fillColor: '#141413', borderColor: '#d97757', radius: 8
        });
        engine.drawText('Pod 配置', 200, 80, {
          color: '#d97757', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('spec:', 80, 105, { color: '#faf9f5', fontSize: 12 });
        engine.drawText('  securityContext:', 80, 125, { color: '#faf9f5', fontSize: 12 });
        engine.drawText('    runAsNonRoot: true', 80, 145, { color: '#c96442', fontSize: 12 });
        engine.drawText('  containers:', 80, 165, { color: '#faf9f5', fontSize: 12 });
        engine.drawText('  - name: app', 80, 185, { color: '#87867f', fontSize: 12 });

        engine.drawArrow(340, 130, 420, 130, { color: '#5e5d59', dashed: [3, 3] });

        engine.drawRect(420, 60, 340, 210, {
          fillColor: '#30302e', borderColor: '#5e5d59', radius: 8
        });
        engine.drawText('容器 SecurityContext 选项：', 590, 78, {
          color: '#faf9f5', fontSize: 12, fontWeight: '600', align: 'center'
        });

        const configs = [
          { id: 'config1', label: 'allowPrivilegeEscalation: false', desc: '最佳实践：阻止权限提升', correct: true },
          { id: 'config2', label: 'privileged: true', desc: '危险：获得完整宿主机权限', correct: false },
          { id: 'config3', label: 'capabilities: ADD [SYS_ADMIN]', desc: '危险：赋予系统管理员权限', correct: false }
        ];

        configs.forEach((c, i) => {
          const x = 440, y = 95 + i * 60;
          const color = c.correct ? '#7c9a5e' : '#b53333';
          engine.drawRect(x, y, 300, 52, {
            fillColor: color + '18', borderColor: color, borderWidth: 1.5, radius: 8,
            id: c.id, interactive: true, data: c
          });
          engine.drawText(c.label, x + 150, y + 14, {
            color: '#faf9f5', fontSize: 12, fontWeight: '600', align: 'center', baseline: 'middle'
          });
          engine.drawText(c.desc, x + 150, y + 36, {
            color: '#87867f', fontSize: 10, align: 'center', baseline: 'middle'
          });
        });

        interactions.onClick(configs.map(c => c.id), (id, data) => {
          if (data.correct) {
            animations.emitParticles(engine, 590, 125, '#7c9a5e', 12);
            app.showFeedback('success', '正确！allowPrivilegeEscalation: false 可防止容器内权限提升攻击。', 1500);
            setTimeout(() => app.onChallengeComplete('security', 2, false), 2000);
          } else {
            app.showFeedback('error', '危险配置！' + data.label + ' 会引入安全风险。', 1500);
          }
        });
      }
    },
    {
      title: '可观测性三大支柱',
      type: 'sequence',
      description: 'K8s 可观测性：指标、日志、链路追踪。请按正确顺序点击。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'metrics', label: '指标（Metrics）', x: 60, y: 80, w: 200, h: 60, color: '#d97757',
            hint: 'Prometheus 采集 CPU、内存、延迟等指标数据，用于告警和容量规划。' },
          { id: 'logs', label: '日志（Logs）', x: 320, y: 80, w: 200, h: 60, color: '#a08bb5',
            hint: 'Fluentd/Fluent Bit 收集日志到 ELK/Loki，支持统一查询和分析。' },
          { id: 'traces', label: '链路追踪（Traces）', x: 580, y: 80, w: 200, h: 60, color: '#c96442',
            hint: 'Jaeger/Zipkin 通过 traceId 追踪分布式请求的完整调用链路。' },
          { id: 'correlate', label: '关联分析', x: 60, y: 200, w: 200, h: 60, color: '#7c9a5e',
            hint: '通过 traceId 将指标、日志、链路追踪关联起来进行综合分析。' },
          { id: 'alert', label: '告警通知', x: 320, y: 200, w: 200, h: 60, color: '#b53333',
            hint: 'Grafana 整合所有数据源，提供可视化仪表盘和告警通知。' }
        ];

        const correctOrder = steps.map(s => s.id);

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawArrow(260, 110, 320, 110, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(520, 110, 580, 110, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(160, 140, 160, 200, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(680, 140, 680, 170, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(680, 170, 260, 200, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(280, 230, 320, 230, { color: '#5e5d59', dashed: [3, 3] });

        engine.drawText('可观测性三大支柱', engine.width / 2, 25, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawRect(60, 300, 720, 100, {
          fillColor: '#30302e', borderColor: '#5e5d59', radius: 8
        });
        engine.drawText('三大支柱：', 80, 315, { color: '#d97757', fontSize: 12, fontWeight: '600' });
        engine.drawText('指标（Metrics）：发生了什么', 80, 340, { color: '#87867f', fontSize: 11 });
        engine.drawText('日志（Logs）：为什么发生', 80, 360, { color: '#87867f', fontSize: 11 });
        engine.drawText('链路追踪（Traces）：在哪里发生', 80, 380, { color: '#87867f', fontSize: 11 });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ ' + step.hint, 2500);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', '❌ 顺序不对！提示：' + steps[expectedIdx].hint, 1500);
          },
          onComplete() {
            app.showFeedback('success', '🎉 完整链路：指标采集 → 日志收集 → 链路追踪 → 关联分析 → 告警通知！', 4000);
            setTimeout(() => app.onChallengeComplete('security', 3, false), 4500);
          }
        });
      }
    }
  ]
};
