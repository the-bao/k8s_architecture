/**
 * 模块一：整体架构总览
 * 4 个挑战：认识组件、拼装控制面、组件通信、Worker 节点
 */
window.K8sModules = window.K8sModules || {};

window.K8sModules['architecture'] = {
  id: 'architecture',
  description: '理解 Kubernetes Master-Node 架构，认识每个控制面组件的角色和通信方式。',

  challenges: [
    /* ===== 挑战 1：认识组件（探索型） ===== */
    {
      title: '认识组件',
      type: 'explore',
      description: '点击每个组件，了解它在 K8s 集群中的作用。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const components = [
          { id: 'apiserver', label: 'kube-apiserver', x: 120, y: 80, w: 160, h: 56, color: '#d97757',
            info: 'API Server 是集群的入口。所有组件（kubectl、scheduler、controller-manager、kubelet）都通过它通信。它负责认证、鉴权、准入控制和 RESTful API 暴露。' },
          { id: 'etcd', label: 'etcd', x: 120, y: 180, w: 160, h: 56, color: '#a08bb5',
            info: 'etcd 是分布式键值存储，保存集群的所有状态数据：Pod 定义、Service、ConfigMap、Secret 等。API Server 是唯一与 etcd 直接通信的组件。' },
          { id: 'scheduler', label: 'kube-scheduler', x: 120, y: 280, w: 160, h: 56, color: '#7c9a5e',
            info: 'Scheduler 监听新建的、尚未调度的 Pod，根据资源需求、亲和性规则、污点容忍等条件为其选择最优节点。' },
          { id: 'controller', label: 'kube-controller-manager', x: 120, y: 380, w: 180, h: 56, color: '#c96442',
            info: 'Controller Manager 运行多个控制器循环：Deployment Controller 维护副本数、Node Controller 处理节点故障、ReplicaSet Controller 管理Pod 副本等。' },
          { id: 'kubelet', label: 'kubelet', x: 450, y: 140, w: 140, h: 56, color: '#b53333',
            info: 'kubelet 运行在每个 Worker 节点上，负责：监听 API Server 获取分配到本节点的 Pod，拉取镜像，启动/停止容器，汇报节点和 Pod 状态。' },
          { id: 'kubeproxy', label: 'kube-proxy', x: 450, y: 260, w: 140, h: 56, color: '#c49a3c',
            info: 'kube-proxy 运行在每个节点上，维护 iptables/IPVS 规则，实现 Service 的负载均衡和网络代理，将 Service ClusterIP 的流量转发到后端 Pod。' }
        ];

        engine.drawText('☸ 控制面组件', 200, 30, {
          color: '#d97757', fontSize: 16, fontWeight: '600', align: 'center', baseline: 'middle'
        });
        engine.drawText('工作节点组件', 520, 80, {
          color: '#b53333', fontSize: 14, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawLine(350, 60, 350, 440, { color: '#5e5d59', dashed: [4, 4] });

        components.forEach(comp => {
          engine.drawNode(comp.x, comp.y, comp.w, comp.h, comp.label, {
            id: comp.id, borderColor: comp.color, bgColor: comp.color + '11',
            interactive: true, data: comp
          });
        });

        engine.drawArrow(280, 108, 280, 180, { color: '#5e5d59' });
        engine.drawArrow(280, 208, 280, 280, { color: '#5e5d59' });
        engine.drawArrow(280, 308, 280, 380, { color: '#5e5d59' });
        engine.drawCurvedArrow(280, 136, 450, 168, { color: '#5e5d59', curvature: 0.2 });

        engine.drawText('💡 点击任意组件查看详情', engine.width / 2, engine.height - 40, {
          color: '#5e5d59', fontSize: 13, align: 'center', baseline: 'middle'
        });

        let explored = new Set();
        const compIds = components.map(c => c.id);

        interactions.onClick(compIds, (id, data, pos) => {
          app.showTooltip(data.label, data.info, pos.x + 10, pos.y - 20);
          animations.emitParticles(engine, pos.x, pos.y, data.color, 8);
          explored.add(id);
          if (explored.size >= components.length) {
            setTimeout(() => app.onChallengeComplete('architecture', 0, false), 1000);
          }
        });

        interactions.onAnyClick((hit) => {
          if (!hit) app.hideTooltip();
        });
      }
    },

    /* ===== 挑战 2：拼装控制面（拖拽型） ===== */
    {
      title: '拼装控制面',
      type: 'drag',
      description: '将四个控制面组件拖拽到正确的位置，组装完整的 Master 控制面。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const masterX = 300, masterY = 60, masterW = 380, masterH = 380;
        engine.drawRect(masterX, masterY, masterW, masterH, {
          fillColor: '#141413', borderColor: '#d97757', borderWidth: 2, radius: 12
        });
        engine.drawText('Master 控制面', masterX + masterW / 2, masterY + 20, {
          color: '#d97757', fontSize: 14, fontWeight: '600', align: 'center'
        });

        const targets = [
          { id: 'slot-apiserver', x: 330, y: 80, w: 140, h: 50, label: 'API 网关', accepts: 'apiserver' },
          { id: 'slot-etcd', x: 510, y: 80, w: 140, h: 50, label: '状态存储', accepts: 'etcd' },
          { id: 'slot-scheduler', x: 330, y: 200, w: 140, h: 50, label: '调度器', accepts: 'scheduler' },
          { id: 'slot-controller', x: 510, y: 200, w: 140, h: 50, label: '控制器', accepts: 'controller' }
        ];

        targets.forEach(t => {
          engine.drawRect(t.x, t.y, t.w, t.h, {
            fillColor: '#141413', borderColor: '#5e5d59', borderWidth: 1, radius: 6, dashed: true,
            id: t.id, interactive: true, data: t
          });
          engine.drawText('拖入 ' + t.label, t.x + t.w / 2, t.y + t.h / 2, {
            color: '#5e5d59', fontSize: 11, align: 'center', baseline: 'middle'
          });
        });

        const sources = [
          { id: 'apiserver', label: 'kube-apiserver', x: 40, y: 100, w: 130, h: 44, color: '#d97757' },
          { id: 'etcd', label: 'etcd', x: 40, y: 170, w: 130, h: 44, color: '#a08bb5' },
          { id: 'scheduler', label: 'kube-scheduler', x: 40, y: 240, w: 130, h: 44, color: '#7c9a5e' },
          { id: 'controller', label: 'controller-manager', x: 40, y: 310, w: 150, h: 44, color: '#c96442' }
        ];

        sources.sort(() => Math.random() - 0.5);
        sources.forEach((s, i) => {
          s.x = 40;
          s.y = 100 + i * 70;
          engine.drawNode(s.x, s.y, s.w, s.h, s.label, {
            id: s.id, borderColor: s.color, bgColor: s.color + '11',
            interactive: true, data: s
          });
        });

        engine.drawText('📦 将左侧组件拖入右侧对应位置', engine.width / 2, engine.height - 40, {
          color: '#5e5d59', fontSize: 13, align: 'center', baseline: 'middle'
        });

        let placed = 0;
        interactions.enableDrag(sources, targets, {
          onDrop(sourceId, targetId, correct) {
            if (correct) {
              const src = sources.find(s => s.id === sourceId);
              const tgt = targets.find(t => t.id === targetId);
              if (src) {
                engine.drawNode(tgt.x + (tgt.w - src.w) / 2, tgt.y + (tgt.h - src.h) / 2, src.w, src.h, src.label, {
                  borderColor: src.color, bgColor: src.color + '22'
                });
                animations.emitParticles(engine, tgt.x + tgt.w / 2, tgt.y + tgt.h / 2, src.color, 15);
              }
              placed++;
              app.showFeedback('success', '✅ ' + sources.find(s => s.id === sourceId).label + ' 放置正确！', 2000);
              if (placed >= sources.length) {
                setTimeout(() => app.onChallengeComplete('architecture', 1, false), 1500);
              }
            } else {
              app.showFeedback('error', '❌ 位置不对，再想想这个组件的职责是什么？', 1500);
            }
          }
        });
      }
    },

    /* ===== 挑战 3：组件通信（序列型） ===== */
    {
      title: '组件通信',
      type: 'sequence',
      description: '按照正确的顺序点击组件，模拟一个 Pod 创建请求在控制面中的流转路径。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'kubectl', label: 'kubectl', x: 80, y: 200, w: 100, h: 50, color: '#87867f',
            hint: '用户通过 kubectl 发送创建请求' },
          { id: 'apiserver', label: 'API Server', x: 240, y: 200, w: 130, h: 50, color: '#d97757',
            hint: '请求到达 API Server，经过认证、鉴权、准入控制' },
          { id: 'etcd', label: 'etcd', x: 420, y: 200, w: 100, h: 50, color: '#a08bb5',
            hint: 'Pod 定义被持久化到 etcd' },
          { id: 'scheduler', label: 'Scheduler', x: 240, y: 80, w: 130, h: 50, color: '#7c9a5e',
            hint: 'Scheduler 监听到未调度的 Pod，为其选择节点' },
          { id: 'apiserver2', label: 'API Server', x: 420, y: 80, w: 130, h: 50, color: '#d97757',
            hint: 'Scheduler 将调度结果写回 API Server' },
          { id: 'kubelet', label: 'kubelet', x: 600, y: 140, w: 110, h: 50, color: '#b53333',
            hint: 'kubelet 监听到 Pod 分配到本节点，开始创建容器' }
        ];

        const correctOrder = steps.map(s => s.id);

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: { ...step, index: steps.indexOf(step) }
          });
        });

        engine.drawArrow(180, 225, 240, 225, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(370, 225, 420, 225, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawCurvedArrow(470, 200, 305, 130, { color: '#5e5d59', dashed: [3, 3], curvature: -0.3 });
        engine.drawArrow(370, 105, 420, 105, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawCurvedArrow(550, 105, 655, 165, { color: '#5e5d59', dashed: [3, 3], curvature: 0.2 });

        engine.drawText('🚀 Pod 创建请求的流转路径', engine.width / 2, 25, {
          color: '#faf9f5', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawText('💡 按正确顺序点击组件，模拟请求流转', engine.width / 2, engine.height - 40, {
          color: '#5e5d59', fontSize: 13, align: 'center', baseline: 'middle'
        });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: { ...step, index: idx }
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', '✅ 第 ' + (idx + 1) + ' 步：' + step.hint, 2000);
          },
          onWrongStep(id, expectedIdx) {
            const correctStep = steps[expectedIdx];
            app.showFeedback('error', '❌ 顺序不对！下一个应该是「' + correctStep.label + '」— 提示：' + correctStep.hint, 1500);
          },
          onComplete() {
            setTimeout(() => app.onChallengeComplete('architecture', 2, false), 1000);
          }
        });
      }
    },

    /* ===== 挑战 4：Worker 节点（拖拽型） ===== */
    {
      title: 'Worker 节点',
      type: 'drag',
      description: '将 Worker 节点的三个关键组件拖拽到正确位置，组装一个完整的工作节点。',
      render(engine, animations, interactions, app) {
        engine.clear();

        const nodeX = 280, nodeY = 60, nodeW = 400, nodeH = 380;
        engine.drawRect(nodeX, nodeY, nodeW, nodeH, {
          fillColor: '#141413', borderColor: '#b53333', borderWidth: 2, radius: 12
        });
        engine.drawText('Worker Node', nodeX + nodeW / 2, nodeY + 20, {
          color: '#b53333', fontSize: 14, fontWeight: '600', align: 'center'
        });

        const targets = [
          { id: 'slot-kubelet', x: 320, y: 90, w: 150, h: 55, label: '节点代理', accepts: 'kubelet' },
          { id: 'slot-kubeproxy', x: 510, y: 90, w: 140, h: 55, label: '网络代理', accepts: 'kubeproxy' },
          { id: 'slot-runtime', x: 400, y: 220, w: 160, h: 55, label: '容器运行时', accepts: 'runtime' }
        ];

        targets.forEach(t => {
          engine.drawRect(t.x, t.y, t.w, t.h, {
            fillColor: '#141413', borderColor: '#5e5d59', radius: 6,
            id: t.id, interactive: true, data: t
          });
          engine.drawText('拖入 ' + t.label, t.x + t.w / 2, t.y + t.h / 2, {
            color: '#5e5d59', fontSize: 11, align: 'center', baseline: 'middle'
          });
        });

        engine.drawRect(370, 310, 80, 50, { fillColor: '#7c9a5e11', borderColor: '#7c9a5e', radius: 6 });
        engine.drawText('Pod', 410, 335, { color: '#7c9a5e', fontSize: 11, align: 'center', baseline: 'middle' });
        engine.drawRect(470, 310, 80, 50, { fillColor: '#7c9a5e11', borderColor: '#7c9a5e', radius: 6 });
        engine.drawText('Pod', 510, 335, { color: '#7c9a5e', fontSize: 11, align: 'center', baseline: 'middle' });
        engine.drawText('（运行时负责启动这些 Pod）', nodeX + nodeW / 2, 375, {
          color: '#5e5d59', fontSize: 10, align: 'center', baseline: 'middle'
        });

        const sources = [
          { id: 'kubelet', label: 'kubelet', color: '#b53333' },
          { id: 'kubeproxy', label: 'kube-proxy', color: '#c49a3c' },
          { id: 'runtime', label: '容器运行时 (CRI)', color: '#7c9a5e' }
        ];

        sources.sort(() => Math.random() - 0.5);
        sources.forEach((s, i) => {
          s.x = 50;
          s.y = 120 + i * 90;
          s.w = 140;
          s.h = 44;
          engine.drawNode(s.x, s.y, s.w, s.h, s.label, {
            id: s.id, borderColor: s.color, bgColor: s.color + '11',
            interactive: true, data: s
          });
        });

        engine.drawArrow(480, 275, 430, 310, { color: '#5e5d59', dashed: [3, 3] });
        engine.drawArrow(480, 275, 530, 310, { color: '#5e5d59', dashed: [3, 3] });

        engine.drawText('📦 将组件拖入 Worker Node', engine.width / 2, engine.height - 40, {
          color: '#5e5d59', fontSize: 13, align: 'center', baseline: 'middle'
        });

        let placed = 0;
        interactions.enableDrag(sources, targets, {
          onDrop(sourceId, targetId, correct) {
            if (correct) {
              const src = sources.find(s => s.id === sourceId);
              const tgt = targets.find(t => t.id === targetId);
              engine.drawNode(tgt.x + (tgt.w - src.w) / 2, tgt.y + (tgt.h - src.h) / 2, src.w, src.h, src.label, {
                borderColor: src.color, bgColor: src.color + '22'
              });
              animations.emitParticles(engine, tgt.x + tgt.w / 2, tgt.y + tgt.h / 2, src.color, 15);
              placed++;
              app.showFeedback('success', '✅ ' + src.label + ' 放置正确！', 1500);
              if (placed >= sources.length) {
                setTimeout(() => app.onChallengeComplete('architecture', 3, false), 1500);
              }
            } else {
              app.showFeedback('error', '❌ 位置不对，想想这个组件在节点上负责什么？', 1500);
            }
          }
        });
      }
    }
  ]
};