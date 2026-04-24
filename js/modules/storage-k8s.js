/**
 * 模块四：存储架构
 * 4 个挑战：存储类型、动态供应、绑定挂载、数据生命周期
 */
window.K8sModules['storage'] = {
  id: 'storage',
  description: '理解 PVC 如何找到它的 PV，CSI 如何工作，以及不同存储类型的特点。',

  challenges: [
    /* ===== 挑战 1：存储类型（选择分类型） ===== */
    {
      title: '存储类型',
      type: 'choice',
      description: '区分 K8s 中的三种存储类型：emptyDir、hostPath、PersistentVolumeClaim。选择正确的使用场景。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('💾 Kubernetes 存储类型', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // 三种存储类型卡片
        const types = [
          { id: 'emptydir', label: 'emptyDir', color: '#58a6ff',
            desc: '临时存储，随 Pod 删除而删除。用于临时缓存、合并排序等。',
            useCase: '临时工作目录' },
          { id: 'hostpath', label: 'hostPath', color: '#d29922',
            desc: '挂载节点本地文件系统。用于节点级别日志、节点 GPU 驱动等。',
            useCase: '节点级别持久化' },
          { id: 'pvc', label: 'PersistentVolumeClaim', color: '#3fb950',
            desc: '动态申请的持久化存储，由 PV 提供，不依赖特定节点。',
            useCase: '有状态应用的数据持久化' }
        ];

        types.forEach((t, i) => {
          const x = 80 + i * 260;
          engine.drawRect(x, 60, 220, 140, {
            fillColor: t.color + '08', borderColor: t.color, radius: 10
          });
          engine.drawText(t.label, x + 110, 80, {
            color: t.color, fontSize: 13, fontWeight: '600', align: 'center'
          });
          engine.drawText(t.desc, x + 110, 110, {
            color: '#8b949e', fontSize: 10, align: 'center'
          });
          engine.drawText('场景：' + t.useCase, x + 110, 175, {
            color: '#e6edf3', fontSize: 11, align: 'center'
          });
        });

        engine.drawText('❓ 场景题：一个 MySQL 数据库需要持久化存储数据，应该使用哪种存储类型？',
          engine.width / 2, 240, { color: '#e6edf3', fontSize: 13, align: 'center' });

        interactions.enableChoice(
          [
            { id: 'ans-empty', label: 'emptyDir', desc: 'Pod 删除后数据丢失，不适合数据库' },
            { id: 'ans-host', label: 'hostPath', desc: '挂载单个节点，Pod 调度到其他节点会丢失数据' },
            { id: 'ans-pvc', label: 'PVC（推荐）', desc: '动态 PV，不依赖特定节点，适合有状态应用' }
          ],
          'ans-pvc',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 正确！MySQL 是有状态应用，需要持久化存储。PVC 从 PersistentVolume 动态申请空间，' +
                '不依赖特定节点，Pod 调度到任意节点都能访问同一个 PV。',
                4000);
              setTimeout(() => app.onChallengeComplete('storage', 0, false), 1500);
            } else {
              app.showFeedback('error', '❌ 数据库需要持久化存储。emptyDir 会随 Pod 删除丢失，hostPath 依赖单节点。', 3000);
            }
          }
        );
      }
    },

    /* ===== 挑战 2：动态供应（配置型） ===== */
    {
      title: '动态供应',
      type: 'choice',
      description: '配置 StorageClass 来动态创建 PV。选择正确的 StorageClass 配置。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('📦 StorageClass 动态供应', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // PVC 申请
        engine.drawRect(80, 60, 300, 80, {
          fillColor: '#d2a8ff11', borderColor: '#d2a8ff', radius: 8
        });
        engine.drawText('PVC 申请', 230, 78, {
          color: '#d2a8ff', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('storageClassName: "fast-storage"\nrequest: 10Gi | accessMode: ReadWriteOnce', 230, 102, {
          color: '#8b949e', fontSize: 10, align: 'center'
        });

        // StorageClass 选项
        engine.drawText('选择正确的 StorageClass 配置：', 80, 170, {
          color: '#e6edf3', fontSize: 12
        });

        interactions.enableChoice(
          [
            { id: 'sc1', label: 'provisioner: kubernetes.io/gce-pd\nparameters.type: pd-ssd\nreclaimPolicy: Delete',
              desc: '云盘 SSD + 动态供应（推荐）' },
            { id: 'sc2', label: 'provisioner: kubernetes.io/no-provisioner\nvolumeBindingMode: WaitForFirstConsumer',
              desc: '静态供应，需手动创建 PV' },
            { id: 'sc3', label: 'provisioner: kubernetes.io/aws-ebs\nparameters.type: gp2\nreclaimPolicy: Retain',
              desc: '通用 SSD + 保留策略（手动清理）' }
          ],
          'sc1',
          (correct) => {
            if (correct) {
              app.showFeedback('success',
                '✅ 正确！kubernetes.io/gce-pd 是 GCE/GKE 的存储供应器，pd-ssd 提供高性能 SSD 云盘。' +
                '动态供应意味着 PVC 创建时自动创建 PV，无需手动预配。',
                4000);
              setTimeout(() => app.onChallengeComplete('storage', 1, false), 1500);
            } else {
              app.showFeedback('error',
                '❌ 配置不对。注意：no-provisioner 是静态供应（手动创建 PV）；gp2 是通用 SSD 但 Retain 策略需要手动清理。',
                4000);
            }
          }
        );
      }
    },

    /* ===== 挑战 3：绑定挂载（拖拽型） ===== */
    {
      title: '绑定挂载',
      type: 'drag',
      description: '将 PVC 拖拽到 Pod 上，PVC 会自动绑定到匹配的 PV 并挂载到容器。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🔗 PVC 绑定与挂载', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // PV 池
        engine.drawRect(40, 60, 200, 200, {
          fillColor: '#0d1117', borderColor: '#484f58', radius: 10
        });
        engine.drawText('PV 池', 140, 78, {
          color: '#8b949e', fontSize: 12, fontWeight: '600', align: 'center'
        });

        const pvs = [
          { id: 'pv1', label: 'PV-5Gi-RWO', x: 70, y: 110, w: 140, h: 35, color: '#3fb950',
            size: '5Gi', access: 'RWO', status: '未绑定' },
          { id: 'pv2', label: 'PV-10Gi-RWX', x: 70, y: 160, w: 140, h: 35, color: '#f85149',
            size: '10Gi', access: 'RWX', status: '已绑定' },
          { id: 'pv3', label: 'PV-20Gi-RWO', x: 70, y: 210, w: 140, h: 35, color: '#d29922',
            size: '20Gi', access: 'RWO', status: '未绑定' }
        ];

        pvs.forEach(pv => {
          engine.drawRect(pv.x, pv.y, pv.w, pv.h, {
            fillColor: pv.color + '11', borderColor: pv.color, radius: 6,
            id: pv.id, interactive: true, data: pv
          });
          engine.drawText(pv.label, pv.x + pv.w / 2, pv.y + 12, {
            color: pv.color, fontSize: 10, fontWeight: '600', align: 'center'
          });
          engine.drawText(pv.size + ' | ' + pv.access + ' | ' + pv.status, pv.x + pv.w / 2, pv.y + 26, {
            color: '#8b949e', fontSize: 9, align: 'center'
          });
        });

        // 箭头
        engine.drawArrow(240, 150, 300, 150, { color: '#30363d', dashed: [3, 3] });

        // Pod
        engine.drawRect(320, 80, 200, 160, {
          fillColor: '#0d1117', borderColor: '#58a6ff', radius: 10
        });
        engine.drawText('Pod (mysql)', 420, 98, {
          color: '#58a6ff', fontSize: 12, fontWeight: '600', align: 'center'
        });

        // PVC 目标
        const pvcTarget = {
          id: 'pvc-slot', x: 350, y: 130, w: 140, h: 50,
          label: 'PVC (5Gi, RWO)', accepts: 'pvc',
          x: 350, y: 130, w: 140, h: 50
        };

        engine.drawRect(pvcTarget.x, pvcTarget.y, pvcTarget.w, pvcTarget.h, {
          fillColor: '#d2a8ff11', borderColor: '#d2a8ff', radius: 6,
          id: pvcTarget.id, interactive: true, data: pvcTarget
        });
        engine.drawText('拖入 PVC\n(请求 5Gi, RWO)', pvcTarget.x + pvcTarget.w / 2, pvcTarget.y + pvcTarget.h / 2, {
          color: '#d2a8ff', fontSize: 11, align: 'center', baseline: 'middle'
        });

        // 挂载点
        engine.drawText('挂载到容器', 420, 200, {
          color: '#8b949e', fontSize: 10, align: 'center'
        });

        // 可拖拽 PVC
        const pvc = { id: 'pvc', label: 'PVC (5Gi, RWO)', x: 560, y: 130, w: 150, h: 50, color: '#d2a8ff' };
        engine.drawNode(pvc.x, pvc.y, pvc.w, pvc.h, pvc.label, {
          id: pvc.id, borderColor: pvc.color, bgColor: pvc.color + '11',
          interactive: true, data: pvc
        });

        // 提示
        engine.drawRect(40, 300, 700, 60, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('💡 提示：PVC 会根据容量和访问模式自动匹配 PV（大小 >= 请求，且 accessMode 兼容）。', 50, 315, {
          color: '#8b949e', fontSize: 11
        });
        engine.drawText('PVC (5Gi, RWO) 会绑定到 PV-5Gi-RWO（5Gi >= 5Gi 且 RWO ⊆ RWO）。', 50, 335, {
          color: '#8b949e', fontSize: 11
        });

        interactions.enableDrag([pvc], [pvcTarget], {
          onDrop(sourceId, targetId, correct) {
            if (correct) {
              animations.emitParticles(engine, pvcTarget.x + pvcTarget.w / 2, pvcTarget.y + pvcTarget.h / 2, '#d2a8ff', 20);
              app.showFeedback('success',
                '✅ PVC 成功绑定到 PV-5Gi-RWO！StorageClass 动态创建了 PV，PVC 和 PV 绑定后挂载到容器。',
                4000);
              setTimeout(() => app.onChallengeComplete('storage', 2, false), 2000);
            } else {
              app.showFeedback('error', '❌ 绑定失败！PVC 的访问模式（ReadWriteOnce）和容量需求决定了它只能绑定到兼容的 PV。', 3000);
            }
          }
        });
      }
    },

    /* ===== 挑战 4：数据生命周期（决策型） ===== */
    {
      title: '数据生命周期',
      type: 'decision',
      description: '模拟 Pod 删除后数据的三种不同命运，根据回收策略（Retain/Delete/Recycle）做出决策。',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('🔄 数据生命周期与回收策略', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        // Pod 删除前
        engine.drawRect(40, 60, 220, 120, {
          fillColor: '#0d1117', borderColor: '#58a6ff', radius: 10
        });
        engine.drawText('Pod 运行时', 150, 78, {
          color: '#58a6ff', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('MySQL Pod 正在使用 PV\n数据目录：/var/lib/mysql\n数据已写入 100MB', 150, 108, {
          color: '#8b949e', fontSize: 10, align: 'center'
        });

        // 删除箭头
        engine.drawText('Pod 被删除 ↓', 150, 195, {
          color: '#f85149', fontSize: 12, align: 'center'
        });
        engine.drawLine(150, 180, 150, 200, { color: '#f85149', width: 2 });

        // 三种回收策略
        const policies = [
          { id: 'retain', label: 'Retain', color: '#d29922',
            desc: '保留数据，PV 变为 Released 状态\n需要手动删除 PV 和数据',
            outcome: '数据保留，可恢复' },
          { id: 'delete', label: 'Delete', color: '#f85149',
            desc: '删除 PV，云盘等存储资源也被删除\n数据无法恢复',
            outcome: '数据永久丢失' },
          { id: 'recycle', label: 'Recycle', color: '#3fb950',
            desc: '删除数据但保留 PV，PV 变为 Available\n可被新 PVC 重新绑定',
            outcome: '数据清除，PV 可复用' }
        ];

        policies.forEach((p, i) => {
          const x = 60 + i * 240;
          engine.drawRect(x, 230, 200, 120, {
            fillColor: p.color + '08', borderColor: p.color, radius: 10,
            id: p.id, interactive: true, data: p
          });
          engine.drawText(p.label, x + 100, 250, {
            color: p.color, fontSize: 14, fontWeight: '600', align: 'center'
          });
          engine.drawText(p.desc, x + 100, 280, {
            color: '#8b949e', fontSize: 10, align: 'center'
          });
          engine.drawText('结果：' + p.outcome, x + 100, 330, {
            color: p.color, fontSize: 10, fontWeight: '600', align: 'center'
          });
        });

        engine.drawText('❓ 如果 PVC 的回收策略是 Delete，删除 Pod 后数据会怎样？', 400, 380, {
          color: '#e6edf3', fontSize: 12, align: 'center'
        });

        const policyIds = policies.map(p => p.id);
        interactions.onClick(policyIds, (id, data) => {
          if (id === 'delete') {
            animations.emitParticles(engine, 160, 290, '#f85149', 15);
            app.showFeedback('success',
              '✅ 正确！Delete 策略会删除 PV 和底层存储资源（如云盘），数据永久丢失，无法恢复。' +
              '生产环境重要数据应使用 Retain 策略或开启快照备份。',
              4000);
            setTimeout(() => app.onChallengeComplete('storage', 3, false), 1500);
          } else if (id === 'retain') {
            app.showFeedback('error', '❌ Retain 策略会保留数据，不是 Delete。', 3000);
          } else {
            app.showFeedback('error', '❌ Recycle 会删除数据但保留 PV，也不是 Delete。', 3000);
          }
        });
      }
    }
  ]
};