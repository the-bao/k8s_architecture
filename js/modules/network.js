/**
 * 模块三：网络架构
 * 5 个挑战：同节点通信、跨节点通信、Service 发现、Ingress 路由、网络策略
 */
window.K8sModules['network'] = {
  id: 'network',
  description: '可视化数据包在 Pod 间、节点间、Service 间的完整路径，理解 K8s 网络模型。',

  challenges: [
    /* ===== 挑战 1：同节点通信（动画型） ===== */
    {
      title: '同节点通信',
      type: 'animation',
      description: '观察数据包从 Pod-A 发送到同节点 Pod-B 的完整路径，理解 veth pair 和网桥的作用。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawNode(60, 60, 140, 50, 'Pod-A\n10.244.1.5', {
          borderColor: '#7c9a5e', bgColor: '#7c9a5e11', id: 'pod-a'
        });

        engine.drawRect(230, 65, 100, 40, {
          fillColor: '#d9775711', borderColor: '#d97757', radius: 6, id: 'veth-a'
        });
        engine.drawText('veth-A', 280, 85, { color: '#d97757', fontSize: 11, align: 'center', baseline: 'middle' });

        engine.drawRect(360, 45, 140, 80, {
          fillColor: '#c49a3c11', borderColor: '#c49a3c', radius: 8, id: 'bridge'
        });
        engine.drawText('🌉 cbr0 网桥', 430, 70, { color: '#c49a3c', fontSize: 12, fontWeight: '600', align: 'center' });
        engine.drawText('MAC 学习\nARP 解析', 430, 95, { color: '#87867f', fontSize: 10, align: 'center' });

        engine.drawRect(530, 65, 100, 40, {
          fillColor: '#d9775711', borderColor: '#d97757', radius: 6, id: 'veth-b'
        });
        engine.drawText('veth-B', 580, 85, { color: '#d97757', fontSize: 11, align: 'center', baseline: 'middle' });

        engine.drawNode(660, 60, 140, 50, 'Pod-B\n10.244.1.8', {
          borderColor: '#7c9a5e', bgColor: '#7c9a5e11', id: 'pod-b'
        });

        engine.drawArrow(200, 85, 230, 85, { color: '#d97757' });
        engine.drawArrow(330, 85, 360, 85, { color: '#d97757' });
        engine.drawArrow(500, 85, 530, 85, { color: '#d97757' });
        engine.drawArrow(630, 85, 660, 85, { color: '#d97757' });

        engine.drawText('📍 同节点 Pod 间通信路径', engine.width / 2, 20, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawRect(80, 180, 700, 100, {
          fillColor: '#30302e', borderColor: '#5e5d59', radius: 8
        });
        engine.drawText('💡 通信原理：', 100, 195, { color: '#d97757', fontSize: 12, fontWeight: '600' });
        engine.drawText('1. Pod-A 通过 eth0 发送数据包（目的 IP: 10.244.1.8）', 100, 218, { color: '#87867f', fontSize: 11 });
        engine.drawText('2. 数据包通过 veth-A 到达网桥 cbr0', 100, 240, { color: '#87867f', fontSize: 11 });
        engine.drawText('3. 网桥查找 MAC 地址表，通过 ARP 解析将数据转发到 veth-B', 100, 262, { color: '#87867f', fontSize: 11 });

        const btn = document.createElement('div');
        btn.style.cssText = 'position:absolute;bottom:60px;left:50%;transform:translateX(-50%);background:#c96442;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;z-index:100;';
        btn.textContent = '▶ 播放数据包动画';
        document.getElementById('canvas-container').appendChild(btn);

        btn.addEventListener('click', () => {
          btn.style.display = 'none';
          const points = [
            { x: 130, y: 85 }, { x: 200, y: 85 }, { x: 230, y: 85 },
            { x: 330, y: 85 }, { x: 360, y: 85 },
            { x: 500, y: 85 }, { x: 530, y: 85 },
            { x: 630, y: 85 }, { x: 660, y: 85 }
          ];

          animations.flowAlongPath(engine, points, '#7c9a5e', {
            speed: 0.003,
            dotSize: 6,
            onReachPoint(idx) {
              const labels = [
                'Pod-A 发送数据', '进入 veth-A', '到达网桥 cbr0',
                'MAC/ARP 查找', '网桥转发', '进入 veth-B', '到达 Pod-B'
              ];
              if (labels[idx]) app.showFeedback('info', '📍 ' + labels[idx], 1500);
            }
          });

          setTimeout(() => app.onChallengeComplete('network', 0, false), 8000);
        });
      }
    },

    /* ===== 挑战 2：跨节点通信（动画型） ===== */
    {
      title: '跨节点通信',
      type: 'animation',
      description: '数据包从 Node-1 的 Pod 发送到 Node-2 的 Pod，需要经过 VXLAN 隧道。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🌏 跨节点 Pod 通信', engine.width / 2, 15, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawRect(30, 35, 340, 155, {
          fillColor: '#141413', borderColor: '#7c9a5e', radius: 10, id: 'node1'
        });
        engine.drawText('Node-1 (10.244.1.0/24)', 200, 52, {
          color: '#7c9a5e', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawNode(80, 75, 120, 40, 'Pod-A\n10.244.1.5', {
          borderColor: '#7c9a5e', bgColor: '#7c9a5e11', id: 'pod-a'
        });
        engine.drawRect(240, 70, 100, 50, {
          fillColor: '#c49a3c11', borderColor: '#c49a3c', radius: 6, id: 'cbr1'
        });
        engine.drawText('cbr0', 290, 95, { color: '#c49a3c', fontSize: 11, align: 'center', baseline: 'middle' });

        engine.drawRect(430, 35, 340, 155, {
          fillColor: '#141413', borderColor: '#d97757', radius: 10, id: 'node2'
        });
        engine.drawText('Node-2 (10.244.2.0/24)', 600, 52, {
          color: '#d97757', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawNode(480, 75, 120, 40, 'Pod-B\n10.244.2.8', {
          borderColor: '#d97757', bgColor: '#d9775711', id: 'pod-b'
        });
        engine.drawRect(640, 70, 100, 50, {
          fillColor: '#c49a3c11', borderColor: '#c49a3c', radius: 6, id: 'cbr2'
        });
        engine.drawText('cbr0', 690, 95, { color: '#c49a3c', fontSize: 11, align: 'center', baseline: 'middle' });

        engine.drawRect(30, 210, 740, 90, {
          fillColor: '#c9644211', borderColor: '#c96442', radius: 8
        });
        engine.drawText('🌐 VXLAN 隧道 (UDP port 4789)', 400, 227, {
          color: '#c96442', fontSize: 13, fontWeight: '600', align: 'center'
        });
        engine.drawText('跨节点流量封装在 UDP 数据包中，通过底层网络传输', 400, 248, {
          color: '#87867f', fontSize: 11, align: 'center'
        });
        engine.drawText('Pod-A → Pod-B（10.244.1.5 → 10.244.2.8）', 400, 270, {
          color: '#7c9a5e', fontSize: 11, align: 'center'
        });

        engine.drawRect(30, 315, 740, 65, {
          fillColor: '#30302e', borderColor: '#5e5d59', radius: 8
        });
        engine.drawText('💡 VXLAN 原理：每个节点有一个 VTEP（VXLAN Tunnel End Point），负责封装/解封装。', 50, 328, {
          color: '#87867f', fontSize: 11
        });
        engine.drawText('flannel 或 Calico CNI 插件负责维护 VNI（VXLAN Network Identifier）和 MAC 地址映射表。', 50, 348, {
          color: '#87867f', fontSize: 11
        });

        const btn = document.createElement('div');
        btn.style.cssText = 'position:absolute;bottom:40px;left:50%;transform:translateX(-50%);background:#c96442;color:#fff;padding:8px 16px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:600;z-index:100;';
        btn.textContent = '▶ 播放 VXLAN 隧道动画';
        document.getElementById('canvas-container').appendChild(btn);

        btn.addEventListener('click', () => {
          btn.style.display = 'none';
          const flowPoints = [
            { x: 140, y: 95 }, { x: 240, y: 95 },
            { x: 290, y: 95 }, { x: 290, y: 155 },
            { x: 400, y: 210 }, { x: 510, y: 210 },
            { x: 640, y: 155 }, { x: 690, y: 95 },
            { x: 540, y: 95 }
          ];

          animations.flowAlongPath(engine, flowPoints, '#c96442', {
            speed: 0.0015,
            dotSize: 7,
            onReachPoint(idx) {
              const msgs = [
                'Pod-A 发送数据（目的 IP: 10.244.2.8）',
                '数据到达 cbr0 网桥',
                'VTEP-1 封装：原始 IP 包 + VXLAN 头 + UDP + IP 外层',
                '封装后数据包通过底层网络发送到 Node-2',
                '传输中...',
                'VTEP-2 收到数据包，解封装',
                '转发到 Node-2 的 cbr0 网桥',
                '网桥查找 MAC 表，转发给 veth-B',
                'Pod-B 收到数据'
              ];
              if (msgs[idx]) app.showFeedback('info', '📍 ' + msgs[idx], 1800);
            }
          });

          setTimeout(() => app.onChallengeComplete('network', 1, false), 15000);
        });
      }
    },

    /* ===== 挑战 3：Service 发现（序列型） ===== */
    {
      title: 'Service 发现',
      type: 'sequence',
      description: '从 DNS 查询到 iptables 规则的完整链路，理解 ClusterIP Service 如何将流量转发到后端 Pod。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'dns-lookup', label: 'DNS 查询', x: 60, y: 80, w: 130, h: 50, color: '#d97757',
            hint: 'Client Pod 通过 clusterIP:80 访问 Service，CoreDNS 解析 serviceName.namespace.svc.cluster.local' },
          { id: 'clusterip', label: 'ClusterIP 路由', x: 250, y: 80, w: 130, h: 50, color: '#a08bb5',
            hint: 'Service 的虚拟 IP（ClusterIP）仅在集群内部路由，不对应真实网卡' },
          { id: 'iptables', label: 'iptables 规则', x: 440, y: 80, w: 130, h: 50, color: '#c49a3c',
            hint: 'kube-proxy 将 Service ClusterIP 转换为后端 Pod 的真实 IP（Endpoint）' },
          { id: 'endpoint', label: '转发到 Endpoint', x: 630, y: 80, w: 130, h: 50, color: '#7c9a5e',
            hint: 'iptables DNAT 规则将目标 IP 改为某个后端 Pod 的真实 IP' },
          { id: 'pod-receive', label: 'Pod 接收', x: 630, y: 200, w: 130, h: 50, color: '#b53333',
            hint: '数据包到达后端 Pod，Pod 收到请求并返回响应' }
        ];

        const correctOrder = ['dns-lookup', 'clusterip', 'iptables', 'endpoint', 'pod-receive'];

        engine.drawRect(430, 50, 340, 230, {
          fillColor: '#141413', borderColor: '#a08bb5', radius: 12
        });
        engine.drawText('ClusterIP Service', 600, 72, {
          color: '#a08bb5', fontSize: 13, fontWeight: '600', align: 'center'
        });

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawArrow(190, 105, 250, 105, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(380, 105, 440, 105, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(570, 105, 630, 105, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(695, 130, 695, 200, { color: '#5e5d59', dashed: [3, 3] });

        engine.drawText('🔍 Service 发现与流量转发', engine.width / 2, 25, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawText('👆 请按正确顺序依次点击节点：从 DNS 查询开始，到 Pod 接收结束', engine.width / 2, 310, {
          color: '#c49a3c', fontSize: 12, align: 'center', baseline: 'middle'
        });

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
            app.showFeedback('success', '🎉 完整链路：Client 发起 DNS 查询 → ClusterIP 路由 → iptables DNAT → Endpoint 转发 → Pod 收到请求。这就是 Service 发现的核心流程！', 4000);
            setTimeout(() => app.onChallengeComplete('network', 2, false), 4500);
          }
        });
      }
    },

    /* ===== 挑战 4：Ingress 路由（配置型） ===== */
    {
      title: 'Ingress 路由',
      type: 'choice',
      description: '配置 Ingress 规则将外部流量正确路由到对应的后端 Service。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🌐 Ingress 路由配置', engine.width / 2, 25, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawText('场景：根据 URL 路径将请求路由到正确的 Service', engine.width / 2, 55, {
          color: '#87867f', fontSize: 12, align: 'center'
        });

        engine.drawNode(60, 100, 100, 40, '🌍 用户请求', {
          borderColor: '#87867f', bgColor: '#87867f11'
        });

        engine.drawRect(220, 80, 160, 80, {
          fillColor: '#d9775711', borderColor: '#d97757', radius: 8
        });
        engine.drawText('Ingress Controller', 300, 105, {
          color: '#d97757', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('nginx-ingress', 300, 125, {
          color: '#87867f', fontSize: 10, align: 'center'
        });

        engine.drawText('路由规则：', 200, 185, { color: '#faf9f5', fontSize: 12, fontWeight: '600' });

        const rules = [
          { path: '/api', service: 'api-service:8080', color: '#7c9a5e' },
          { path: '/web', service: 'web-service:80', color: '#c49a3c' },
          { path: '/admin', service: 'admin-service:8080', color: '#b53333' }
        ];

        rules.forEach((r, i) => {
          engine.drawText(r.path + ' → ' + r.service, 220, 210 + i * 25, { color: r.color, fontSize: 12 });
        });

        const services = [
          { label: 'api-service:8080', x: 460, y: 80, w: 150, h: 40, color: '#7c9a5e' },
          { label: 'web-service:80', x: 460, y: 150, w: 150, h: 40, color: '#c49a3c' },
          { label: 'admin-service:8080', x: 440, y: 220, w: 170, h: 40, color: '#b53333' }
        ];

        services.forEach(s => {
          engine.drawNode(s.x, s.y, s.w, s.h, s.label, { borderColor: s.color, bgColor: s.color + '11' });
          engine.drawArrow(380, 105 + services.indexOf(s) * 70, 460, s.y + 20, { color: s.color, dashed: [3, 3] });
        });

        engine.drawArrow(160, 120, 220, 115, { color: '#d97757' });

        interactions.enableChoice(
          [
            { id: 'path1', label: '访问 /api/users', desc: '应路由到 api-service:8080' },
            { id: 'path2', label: '访问 /web/home', desc: '应路由到 web-service:80' },
            { id: 'path3', label: '访问 /admin/dashboard', desc: '应路由到 admin-service:8080' }
          ],
          'path2',
          (correct) => {
            if (correct) {
              app.showFeedback('success', '✅ 正确！nginx-ingress 根据 path 匹配规则将 /web/* 请求转发到 web-service:80。', 1500);
              setTimeout(() => app.onChallengeComplete('network', 3, false), 1500);
            } else {
              app.showFeedback('error', '❌ 路由错误！检查 Ingress 规则中的 path 匹配方式。', 1500);
            }
          }
        );
      }
    },

    /* ===== 挑战 5：网络策略（配置型） ===== */
    {
      title: '网络策略',
      type: 'choice',
      description: '设置 NetworkPolicy 限制 Pod 间通信：只允许 frontend 访问 backend，不允许 internet 直接访问。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🔒 网络策略配置', engine.width / 2, 25, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        const pods = [
          { id: 'internet', label: '🌐 Internet', x: 60, y: 80, w: 120, h: 40, color: '#87867f', allowed: false },
          { id: 'frontend', label: 'Frontend', x: 240, y: 80, w: 120, h: 40, color: '#d97757', allowed: false },
          { id: 'backend', label: 'Backend', x: 420, y: 80, w: 120, h: 40, color: '#7c9a5e', allowed: true },
          { id: 'database', label: 'Database', x: 600, y: 80, w: 120, h: 40, color: '#b53333', allowed: true }
        ];

        pods.forEach(p => {
          engine.drawNode(p.x, p.y, p.w, p.h, p.label, {
            id: p.id, borderColor: p.color, bgColor: p.color + '11',
            interactive: true, data: p
          });
        });

        engine.drawArrow(180, 100, 240, 100, { color: '#b53333', dashed: [3, 3] });
        engine.drawArrow(360, 100, 420, 100, { color: '#7c9a5e' });
        engine.drawArrow(540, 100, 600, 100, { color: '#b53333', dashed: [3, 3] });

        engine.drawRect(60, 180, 700, 100, {
          fillColor: '#30302e', borderColor: '#5e5d59', radius: 8
        });
        engine.drawText('🎯 安全策略要求：', 80, 195, { color: '#b53333', fontSize: 12, fontWeight: '600' });
        engine.drawText('1. 只允许 Frontend Pod 访问 Backend Pod（禁止 Internet 直接访问 Backend）', 80, 215, { color: '#87867f', fontSize: 11 });
        engine.drawText('2. 只允许 Backend Pod 访问 Database（禁止 Frontend 直接访问 Database）', 80, 235, { color: '#87867f', fontSize: 11 });
        engine.drawText('3. Internet 只能访问 Frontend', 80, 255, { color: '#87867f', fontSize: 11 });

        interactions.enableChoice(
          [
            { id: 'policy1', label: 'Allow Frontend → Backend，Block Internet → Backend',
              desc: '基础隔离：阻止 Internet 直连后端' },
            { id: 'policy2', label: 'Allow Frontend → Backend，Allow Internet → Frontend',
              desc: '推荐配置：Internet→Frontend→Backend 分层访问' },
            { id: 'policy3', label: 'Allow All', desc: '无限制：所有 Pod 可互相访问' }
          ],
          'policy2',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 正确！正确的网络策略是：允许 Frontend → Backend，禁止 Internet → Backend，允许 Frontend → Database（可选）。' +
                '使用 label selector 和 podSelector 来定义策略规则。',
                4000);
              setTimeout(() => app.onChallengeComplete('network', 4, false), 2000);
            } else {
              app.showFeedback('error',
                '❌ 策略不完整！需要同时考虑：1) 允许 Frontend 访问 Backend，2) 阻止 Internet 直连 Backend。',
                4000);
            }
          }
        );
      }
    }
  ]
};
