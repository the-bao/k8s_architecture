/**
 * Module Five: Security and Observability
 * 4 challenges: Auth chain, RBAC permissions, SecurityContext, Observability three pillars
 */
window.K8sModules = window.K8sModules || {};

window.K8sModules['security'] = {
  id: 'security',
  description: 'Understand K8s security mechanisms and the three pillars of observability.',

  challenges: [
    {
      title: 'Auth Chain',
      type: 'decision',
      description: 'A request accessing K8s API needs to pass three security gates.',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('Request Security Chain', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 16, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        const stages = [
          {
            id: 'auth',
            label: 'Authentication',
            x: 80, y: 80, w: 200, h: 80,
            color: '#3fb950',
            hint: 'Verify the identity of the request sender. K8s supports Token, Certificate, OIDC auth. ServiceAccount uses JWT Token.'
          },
          {
            id: 'authz',
            label: 'Authorization',
            x: 340, y: 80, w: 200, h: 80,
            color: '#f0883e',
            hint: 'After auth, verify if identity has permission. K8s supports ABAC, RBAC, Webhook, Node. RBAC is default.'
          },
          {
            id: 'admission',
            label: 'Admission',
            x: 600, y: 80, w: 200, h: 80,
            color: '#d2a8ff',
            hint: 'MutatingWebhook modifies requests, ValidatingWebhook validates policies.'
          }
        ];

        stages.forEach(stage => {
          engine.drawNode(stage.x, stage.y, stage.w, stage.h, stage.label, {
            id: stage.id, borderColor: stage.color, bgColor: stage.color + '11',
            interactive: true, data: stage
          });
        });

        engine.drawArrow(280, 120, 340, 120, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(540, 120, 600, 120, { color: '#30363d', dashed: [3, 3] });

        engine.drawRect(60, 200, 760, 100, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('Security Chain:', 80, 215, { color: '#58a6ff', fontSize: 12, fontWeight: '600' });
        engine.drawText('1. AuthN: Confirm who you are', 80, 240, { color: '#8b949e', fontSize: 11 });
        engine.drawText('2. AuthZ: Confirm what you can do', 80, 260, { color: '#8b949e', fontSize: 11 });
        engine.drawText('3. Admission: Modify or validate', 80, 280, { color: '#8b949e', fontSize: 11 });

        engine.drawText('Click each stage for details', engine.width / 2, engine.height - 40, {
          color: '#484f58', fontSize: 13, align: 'center', baseline: 'middle'
        });

        let explored = new Set();
        const stageIds = stages.map(s => s.id);

        interactions.onClick(stageIds, (id, data, pos) => {
          app.showTooltip(data.label, data.hint, pos.x + 10, pos.y - 20);
          animations.emitParticles(engine, pos.x, pos.y, data.color, 8);
          explored.add(id);
          if (explored.size >= stages.length) {
            app.showFeedback('success', 'Complete security chain: AuthN -> AuthZ -> Admission!', 3000);
            setTimeout(() => app.onChallengeComplete('security', 0, false), 1500);
          }
        });

        interactions.onAnyClick((hit) => {
          if (!hit) app.hideTooltip();
        });
      }
    },
    {
      title: 'RBAC Permissions',
      type: 'choice',
      description: 'Configure minimum permissions for Developer SA: only read Pods in default namespace.',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('RBAC Permission Configuration', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawNode(60, 60, 200, 50, 'Developer SA', {
          borderColor: '#58a6ff', bgColor: '#58a6ff11'
        });
        engine.drawArrow(160, 110, 160, 140, { color: '#30363d' });

        engine.drawRect(60, 140, 200, 60, {
          fillColor: '#d2a8ff11', borderColor: '#d2a8ff', radius: 8
        });
        engine.drawText('default namespace', 160, 160, {
          color: '#d2a8ff', fontSize: 11, align: 'center', baseline: 'middle'
        });

        engine.drawText('Goal: Only read Pods', 380, 70, { color: '#8b949e', fontSize: 12, align: 'center' });

        const podNode = { id: 'pods', label: 'Pods', x: 380, y: 100, w: 140, h: 50, color: '#3fb950' };
        engine.drawNode(podNode.x, podNode.y, podNode.w, podNode.h, podNode.label, {
          borderColor: podNode.color, bgColor: podNode.color + '11'
        });

        engine.drawRect(300, 180, 300, 80, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('Requirements:', 320, 195, { color: '#f0883e', fontSize: 12, fontWeight: '600' });
        engine.drawText('1. Read-only (get, list, watch)', 320, 215, { color: '#8b949e', fontSize: 11 });
        engine.drawText('2. default namespace only', 320, 235, { color: '#8b949e', fontSize: 11 });
        engine.drawText('3. Pods only', 320, 255, { color: '#8b949e', fontSize: 11 });

        interactions.enableChoice(
          [
            { id: 'wrong1', label: 'ClusterRole + ClusterRoleBinding', desc: 'Cluster-wide, too broad' },
            { id: 'correct', label: 'Role + RoleBinding', desc: 'Correct: namespace scoped' },
            { id: 'wrong2', label: 'admin ClusterRole to SA', desc: 'Violates least privilege' }
          ],
          'correct',
          (correct) => {
            if (correct) {
              app.showFeedback('success', 'Correct! Role + RoleBinding follows least privilege.', 4000);
              animations.emitParticles(engine, 450, 125, '#3fb950', 15);
              setTimeout(() => app.onChallengeComplete('security', 1, false), 2000);
            } else {
              app.showFeedback('error', 'Incorrect! Use Role not ClusterRole, follow least privilege.', 4000);
            }
          }
        );
      }
    },
    {
      title: 'SecurityContext',
      type: 'choice',
      description: 'Configure SecurityContext to enhance container security.',
      render(engine, animations, interactions, app) {
        engine.clear();

        engine.drawText('SecurityContext Configuration', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawRect(60, 60, 280, 140, {
          fillColor: '#0d1117', borderColor: '#58a6ff', radius: 8
        });
        engine.drawText('Pod Spec', 200, 80, {
          color: '#58a6ff', fontSize: 12, fontWeight: '600', align: 'center'
        });
        engine.drawText('spec:', 80, 105, { color: '#e6edf3', fontSize: 12 });
        engine.drawText('  securityContext:', 80, 125, { color: '#e6edf3', fontSize: 12 });
        engine.drawText('    runAsNonRoot: true', 80, 145, { color: '#f0883e', fontSize: 12 });
        engine.drawText('  containers:', 80, 165, { color: '#e6edf3', fontSize: 12 });
        engine.drawText('  - name: app', 80, 185, { color: '#8b949e', fontSize: 12 });

        engine.drawArrow(340, 130, 420, 130, { color: '#30363d', dashed: [3, 3] });

        engine.drawRect(420, 60, 340, 140, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('Container SecurityContext:', 440, 80, {
          color: '#e6edf3', fontSize: 12, fontWeight: '600'
        });

        const configs = [
          { id: 'config1', label: 'allowPrivilegeEscalation: false', desc: 'Best practice: prevent privilege gain', correct: true },
          { id: 'config2', label: 'privileged: true', desc: 'Dangerous: full host privileges', correct: false },
          { id: 'config3', label: 'capabilities: ADD [SYS_ADMIN]', desc: 'Dangerous: system admin access', correct: false }
        ];

        configs.forEach((c, i) => {
          const x = 440, y = 110 + i * 45;
          engine.drawNode(x, y, 300, 35, c.label, {
            borderColor: c.correct ? '#3fb950' : '#f85149',
            bgColor: (c.correct ? '#3fb950' : '#f85149') + '11',
            id: c.id, interactive: true, data: c
          });
          engine.drawText(c.desc, x + 10, y + 38, { color: '#8b949e', fontSize: 10 });
        });

        interactions.onClick(configs.map(c => c.id), (id, data) => {
          if (data.correct) {
            animations.emitParticles(engine, 590, 125, '#3fb950', 12);
            app.showFeedback('success', 'Correct! allowPrivilegeEscalation: false prevents privilege escalation.', 4000);
            setTimeout(() => app.onChallengeComplete('security', 2, false), 2000);
          } else {
            app.showFeedback('error', 'Dangerous config! ' + data.label + ' introduces security risks.', 4000);
          }
        });
      }
    },
    {
      title: 'Observability Three Pillars',
      type: 'sequence',
      description: 'K8s observability: Metrics, Logs, Traces. Click in correct order.',
      render(engine, animations, interactions, app) {
        engine.clear();

        const steps = [
          { id: 'metrics', label: 'Metrics', x: 60, y: 80, w: 200, h: 60, color: '#58a6ff',
            hint: 'Prometheus collects CPU, memory, latency metrics for alerting.' },
          { id: 'logs', label: 'Logs', x: 320, y: 80, w: 200, h: 60, color: '#d2a8ff',
            hint: 'Fluentd/Fluent Bit collect logs to ELK/Loki for unified querying.' },
          { id: 'traces', label: 'Traces', x: 580, y: 80, w: 200, h: 60, color: '#f0883e',
            hint: 'Jaeger/Zipkin trace distributed requests through traceId.' },
          { id: 'correlate', label: 'Correlation', x: 60, y: 200, w: 200, h: 60, color: '#3fb950',
            hint: 'Connect metrics, logs, traces through traceId for analysis.' },
          { id: 'alert', label: 'Alerting', x: 320, y: 200, w: 200, h: 60, color: '#f85149',
            hint: 'Grafana integrates all data for dashboards and alerting.' }
        ];

        const correctOrder = steps.map(s => s.id);

        steps.forEach(step => {
          engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
            id: step.id, borderColor: step.color, bgColor: step.color + '11',
            interactive: true, data: step
          });
        });

        engine.drawArrow(260, 110, 320, 110, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(520, 110, 580, 110, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(160, 140, 160, 200, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(420, 200, 420, 260, { color: '#30363d', dashed: [3, 3] });
        engine.drawArrow(280, 230, 320, 230, { color: '#30363d', dashed: [3, 3] });

        engine.drawText('Observability Three Pillars', engine.width / 2, 25, {
          color: '#e6edf3', fontSize: 15, fontWeight: '600', align: 'center', baseline: 'middle'
        });

        engine.drawRect(60, 300, 720, 80, {
          fillColor: '#161b22', borderColor: '#30363d', radius: 8
        });
        engine.drawText('Three Pillars:', 80, 315, { color: '#58a6ff', fontSize: 12, fontWeight: '600' });
        engine.drawText('Metrics: what happened', 80, 340, { color: '#8b949e', fontSize: 11 });
        engine.drawText('Logs: why it happened', 80, 360, { color: '#8b949e', fontSize: 11 });
        engine.drawText('Traces: where it happened', 80, 380, { color: '#8b949e', fontSize: 11 });

        interactions.enableSequence(correctOrder, {
          onCorrectStep(id, idx) {
            const step = steps[idx];
            engine.drawNode(step.x, step.y, step.w, step.h, step.label, {
              borderColor: step.color, bgColor: step.color + '33',
              id: step.id, interactive: true, data: step
            });
            animations.addPulse(engine, step.x + step.w / 2, step.y + step.h / 2, step.color);
            app.showFeedback('success', step.hint, 2500);
          },
          onWrongStep(id, expectedIdx) {
            app.showFeedback('error', 'Wrong order! Hint: ' + steps[expectedIdx].hint, 3000);
          },
          onComplete() {
            app.showFeedback('success', 'Complete: Metrics -> Logs -> Traces -> Correlation -> Alerting!', 3000);
            setTimeout(() => app.onChallengeComplete('security', 3, false), 1500);
          }
        });
      }
    }
  ]
};
