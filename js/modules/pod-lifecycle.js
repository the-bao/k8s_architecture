/**
 * 模块二：Pod 创建流程
 * 5 个挑战：发起请求、认证鉴权、持久化、调度决策、启动容器
 */
window.K8sModules['pod-lifecycle'] = {
  id: 'pod-lifecycle',
  description: '从 kubectl run 到容器运行的完整链路，理解每个环节的控制面组件如何协作。',

  challenges: [
    /* ===== 挑战 1：发起请求（序列型） ===== */
    {
      title: '发起请求',
      type: 'sequence',
      description: '模拟 kubectl 发送创建 Pod 请求到 API Server 的完整过程，按正确顺序点击每个步骤。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'user-cmd', label: '用户执行 kubectl run', x: 60, y: 160, w: 170, h: 50, color: '#8b949e',
            hint: '用户在终端输入 kubectl run nginx --image=nginx' },
          { id: 'read-yaml', label: '生成 Pod YAML', x: 60, y: 280, w: 170, h: 50, color: '#d2a8ff',
            hint: 'kubectl 将命令行参数转换为 Pod 定义 YAML' },
          { id: 'http-post', label: '发送 HTTP POST', x: 310, y: 220, w: 160, h: 50, color: '#58a6ff',
            hint: 'kubectl 通过 HTTP POST 将 YAML 发送到 API Server 的 /api/v1/namespaces/default/pods' },
          { id: 'api-receive', label: 'API Server 接收', x: 540, y: 160, w: 150, h: 50, color: '#58a6ff',
            hint: 'API Server 接收到请求，准备进入认证阶段' }
        ];

        const correctOrder = steps.map(s => s.id);

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawArrow(145, 210, 145, 280, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(230, 305, 310, 245, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(470, 245, 540, 185, { color: '#30363d', dashed: [3, 3] });

        engine.drawText('🚀 发起 Pod 创建请求', engine.width / 2, 40, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });
        engine.drawText('💡 按正确顺序点击步骤', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ ' + step.hint, 2000);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', '❌ 顺序不对！提示：' + steps[expectedIdx].hint, 3000);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('pod-lifecycle', 0, false), 1000);
          }
        });
      }
    },

    /* ===== 挑战 2：认证鉴权（选择题） ===== */
    {
      title: '认证鉴权',
      type: 'choice',
      description: 'API Server 收到请求后，需要经过认证和鉴权。选择正确的认证方式来通过请求。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawNode(280, 60, 200, 60, 'API Server', {
          borderColor: '#58a6ff', bgColor: '#58a6ff22'
        });

        engine.drawArrow(150, 90, 280, 90, { color: '#3fb950' });
        engine.drawText('Pod 创建请求', 80, 75, { color: '#3fb950', fontSize: 12 });

        engine.drawRect(200, 180, 360, 80, {
          fillColor: '#d2992211', borderColor: '#d29922', radius: 10
        });
        engine.drawText('🔐 认证关卡', 380, 195, {
          color: '#d29922', fontSize: 13, fontWeight: '600', align: 'center'
        });
        engine.drawText('一个 ServiceAccount 需要访问 API Server，选择认证方式：', 380, 220, {
          color: '#8b949e', fontSize: 11, align: 'center'
        });

        engine.drawRect(200, 310, 360, 80, {
          fillColor: '#f0883e11', borderColor: '#f0883e', radius: 10
        });
        engine.drawText('📋 鉴权关卡', 380, 325, {
          color: '#f0883e', fontSize: 13, fontWeight: '600', align: 'center'
        });
        engine.drawText('该 ServiceAccount 需要创建 Pod 的权限，选择鉴权方式：', 380, 350, {
          color: '#8b949e', fontSize: 11, align: 'center'
        });

        engine.drawArrow(380, 260, 380, 310, { color: '#30363d', dashed: [3, 3] });

        let authPassed = false;

        interactions.enableChoice(
          [
            { id: 'basic', label: '用户名密码', desc: 'Basic Auth' },
            { id: 'token', label: 'Bearer Token（SA Token）', desc: 'JWT Token 认证' },
            { id: 'cert', label: '客户端证书', desc: 'X.509 Certs' }
          ],
          'token',
          (correct, id) => {
            if (correct) {
              authPassed = true;
              app.showFeedback('success', '✅ 正确！ServiceAccount 使用 JWT Token 认证。API Server 验证 Token 签名后确认身份。', 3000);
              setTimeout(() => {
                interactions.enableChoice(
                  [
                    { id: 'abac', label: 'ABAC', desc: '基于属性的访问控制' },
                    { id: 'rbac', label: 'RBAC', desc: '基于角色的访问控制' },
                    { id: 'webhook', label: 'Webhook', desc: '外部鉴权服务' }
                  ],
                  'rbac',
                  (correct2) => {
                    if (correct2) {
                      app.showFeedback('success', '✅ 正确！K8s 默认使用 RBAC。RoleBinding 将 ServiceAccount 绑定到具有 Pod 创建权限的 Role。', 3000);
                      setTimeout(() => app.onChallengeComplete('pod-lifecycle', 1, false), 1500);
                    } else {
                      app.showFeedback('error', '❌ K8s 默认的鉴权方式是 RBAC（基于角色的访问控制）。', 3000);
                    }
                  }
                );
              }, 1000);
            } else {
              app.showFeedback('error', '❌ ServiceAccount 不使用用户名密码认证。它使用自动挂载的 JWT Token（在 /var/run/secrets/kubernetes.io/serviceaccount/ 下）。', 4000);
            }
          }
        );
      }
    },

    /* ===== 挑战 3：持久化（序列型） ===== */
    {
      title: '持久化',
      type: 'sequence',
      description: '请求通过认证后，Pod 定义需要被持久化到 etcd。按正确顺序点击步骤。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'validate', label: '验证 YAML 格式', x: 80, y: 100, w: 150, h: 50, color: '#d29922',
            hint: 'API Server 校验 YAML 的 schema 是否合法' },
          { id: 'admission', label: '准入控制器', x: 80, y: 220, w: 150, h: 50, color: '#f0883e',
            hint: 'MutatingWebhook 修改默认值 → ValidatingWebhook 校验策略' },
          { id: 'encode', label: '编码为 JSON', x: 310, y: 160, w: 140, h: 50, color: '#58a6ff',
            hint: '内部将 YAML 编码为 JSON protobuf 格式' },
          { id: 'write-etcd', label: '写入 etcd', x: 530, y: 100, w: 130, h: 50, color: '#d2a8ff',
            hint: 'Pod 定义持久化到 etcd，状态为 Pending' },
          { id: 'confirm', label: '返回确认', x: 530, y: 220, w: 130, h: 50, color: '#3fb950',
            hint: 'API Server 返回 201 Created 给 kubectl' }
        ];

        const correctOrder = steps.map(s => s.id);

        engine.drawRect(520, 60, 160, 240, {
          fillColor: '#0d1117', borderColor: '#d2a8ff', radius: 12
        });
        engine.drawText('etcd', 600, 80, { color: '#d2a8ff', fontSize: 14, fontWeight: '600', align: 'center' });

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawText('💾 Pod 持久化流程', engine.width / 2, 30, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ ' + step.hint, 2000);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', '❌ 顺序不对！下一步：' + steps[expectedIdx].hint, 3000);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('pod-lifecycle', 2, false), 1000);
          }
        });
      }
    },

    /* ===== 挑战 4：调度决策（决策型） ===== */
    {
      title: '调度决策',
      type: 'decision',
      description: 'Scheduler 需要为 Nginx Pod（需要 CPU 500m / 内存 256Mi）选择最优节点。分析节点资源后做出调度决策。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawNode(280, 30, 180, 50, 'kube-scheduler', {
          borderColor: '#3fb950', bgColor: '#3fb95022'
        });
        engine.drawText('正在为 Nginx Pod（CPU 500m / 内存 256Mi）选择节点...', 370, 100, {
          color: '#8b949e', fontSize: 12, align: 'center'
        });

        engine.drawNode(60, 40, 140, 40, 'Nginx Pod', {
          borderColor: '#d2a8ff', bgColor: '#d2a8ff11'
        });
        engine.drawArrow(200, 60, 280, 55, { color: '#d29922' });

        const nodes = [
          { id: 'node1', label: 'Node-1', x: 80, y: 160, w: 180, h: 120,
            color: '#3fb950', cpu: '40%', mem: '35%', status: '资源充足', schedulable: true },
          { id: 'node2', label: 'Node-2', x: 310, y: 160, w: 180, h: 120,
            color: '#f85149', cpu: '92%', mem: '88%', status: '资源不足', schedulable: false },
          { id: 'node3', label: 'Node-3', x: 540, y: 160, w: 180, h: 120,
            color: '#d29922', cpu: '75%', mem: '70%', status: '资源紧张', schedulable: false }
        ];

        nodes.forEach(node => {
          engine.drawRect(node.x, node.y, node.w, node.h, {
            fillColor: node.color + '08', borderColor: node.color, radius: 10,
            id: node.id, interactive: true, data: node
          });
          engine.drawText(node.label, node.x + node.w / 2, node.y + 20, {
            color: node.color, fontSize: 14, fontWeight: '600', align: 'center'
          });
          engine.drawText('CPU: ' + node.cpu + ' | 内存: ' + node.mem, node.x + node.w / 2, node.y + 50, {
            color: '#8b949e', fontSize: 11, align: 'center'
          });
          engine.drawText(node.status, node.x + node.w / 2, node.y + 75, {
            color: node.color, fontSize: 11, fontWeight: '600', align: 'center'
          });

          const cpuPct = parseInt(node.cpu) / 100;
          engine.drawProgressBar(node.x + 15, node.y + 95, 65, 6, cpuPct, { fillColor: node.color });
          engine.drawProgressBar(node.x + 100, node.y + 95, 65, 6, parseInt(node.mem) / 100, { fillColor: node.color });
        });

        engine.drawText('📊 分析节点资源，选择最优调度目标', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        const nodeIds = nodes.map(n => n.id);

        interactions.onClick(nodeIds, (id, data) => {
          if (data.schedulable) {
            animations.emitParticles(engine, data.x + data.w / 2, data.y + data.h / 2, '#3fb950', 20);
            app.showFeedback('success',
              '✅ 正确！Node-1 资源最充足（CPU 40%、内存 35%）。Scheduler 的打分算法（LeastRequestedPriority）会优先选择资源利用率最低的节点。',
              4000);
            setTimeout(() => app.onChallengeComplete('pod-lifecycle', 3, false), 2000);
          } else {
            const reason = id === 'node2'
              ? 'Node-2 CPU 92%、内存 88%，几乎耗尽，无法承载新 Pod。'
              : 'Node-3 资源紧张（CPU 75%、内存 70%），虽然可以勉强调度，但不是最优选择。';
            app.showFeedback('error', '❌ ' + reason + '提示：选择资源最充足的节点。', 4000);
          }
        });
      }
    },

    /* ===== 挑战 5：启动容器（序列型） ===== */
    {
      title: '启动容器',
      type: 'sequence',
      description: 'kubelet 收到调度结果后，需要完成一系列操作来启动容器。按正确顺序点击。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'watch', label: 'kubelet Watch', x: 60, y: 100, w: 140, h: 50, color: '#f85149',
            hint: 'kubelet 通过 Watch 机制监听 API Server，发现新 Pod 被调度到本节点' },
          { id: 'validate', label: '校验 Pod 规格', x: 60, y: 220, w: 140, h: 50, color: '#d29922',
            hint: 'kubelet 校验 Pod 定义（镜像、资源、挂载卷等）是否合法' },
          { id: 'pull', label: '拉取镜像', x: 260, y: 160, w: 130, h: 50, color: '#58a6ff',
            hint: '容器运行时（containerd）从镜像仓库拉取 nginx:latest' },
          { id: 'mount', label: '挂载存储卷', x: 440, y: 100, w: 130, h: 50, color: '#d2a8ff',
            hint: '如果 Pod 定义了 Volume，先挂载存储卷到指定路径' },
          { id: 'create', label: '创建容器', x: 440, y: 220, w: 130, h: 50, color: '#3fb950',
            hint: '容器运行时根据镜像创建容器进程，配置网络命名空间' },
          { id: 'probe', label: '健康检查', x: 620, y: 160, w: 120, h: 50, color: '#f0883e',
            hint: '启动探针（Startup Probe）和就绪探针（Readiness Probe）检查容器状态' }
        ];

        const correctOrder = steps.map(s => s.id);

        engine.drawRect(230, 60, 370, 240, {
          fillColor: '#0d1117', borderColor: '#3fb950', radius: 12
        });
        engine.drawText('容器运行时 (CRI)', 415, 80, {
          color: '#3fb950', fontSize: 12, fontWeight: '600', align: 'center'
        });

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawText('🐳 容器启动全流程', engine.width / 2, 30, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ ' + step.hint, 2000);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', '❌ 顺序不对！下一步：' + steps[expectedIdx].hint, 3000);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('pod-lifecycle', 4, false), 1000);
          }
        });
      }
    }
  ]
};
