var f,
  l,
  F,
  g,
  s = function (e, t) {
    return {
      name: e,
      value: t === void 0 ? -1 : t,
      delta: 0,
      entries: [],
      id: "v1-"
        .concat(Date.now(), "-")
        .concat(Math.floor(8999999999999 * Math.random()) + 1e12),
    };
  },
  S = function (e, t) {
    try {
      if (PerformanceObserver.supportedEntryTypes.includes(e)) {
        if (e === "first-input" && !("PerformanceEventTiming" in self)) return;
        var i = new PerformanceObserver(function (a) {
          return a.getEntries().map(t);
        });
        return i.observe({ type: e, buffered: !0 }), i;
      }
    } catch {}
  },
  y = function (e, t) {
    var i = function a(n) {
      (n.type !== "pagehide" && document.visibilityState !== "hidden") ||
        (e(n),
        t &&
          (removeEventListener("visibilitychange", a, !0),
          removeEventListener("pagehide", a, !0)));
    };
    addEventListener("visibilitychange", i, !0),
      addEventListener("pagehide", i, !0);
  },
  h = function (e) {
    addEventListener(
      "pageshow",
      function (t) {
        t.persisted && e(t);
      },
      !0
    );
  },
  p = typeof WeakSet == "function" ? new WeakSet() : new Set(),
  m = function (e, t, i) {
    var a;
    return function () {
      t.value >= 0 &&
        (i || p.has(t) || document.visibilityState === "hidden") &&
        ((t.delta = t.value - (a || 0)),
        (t.delta || a === void 0) && ((a = t.value), e(t)));
    };
  },
  q = function (e, t) {
    var i,
      a = s("CLS", 0),
      n = function (r) {
        r.hadRecentInput || ((a.value += r.value), a.entries.push(r), i());
      },
      o = S("layout-shift", n);
    o &&
      ((i = m(e, a, t)),
      y(function () {
        o.takeRecords().map(n), i();
      }),
      h(function () {
        (a = s("CLS", 0)), (i = m(e, a, t));
      }));
  },
  v = -1,
  T = function () {
    return document.visibilityState === "hidden" ? 0 : 1 / 0;
  },
  w = function () {
    y(function (e) {
      var t = e.timeStamp;
      v = t;
    }, !0);
  },
  E = function () {
    return (
      v < 0 &&
        ((v = T()),
        w(),
        h(function () {
          setTimeout(function () {
            (v = T()), w();
          }, 0);
        })),
      {
        get timeStamp() {
          return v;
        },
      }
    );
  },
  A = function (e, t) {
    var i,
      a = E(),
      n = s("FCP"),
      o = function (u) {
        u.name === "first-contentful-paint" &&
          (c && c.disconnect(),
          u.startTime < a.timeStamp &&
            ((n.value = u.startTime), n.entries.push(u), p.add(n), i()));
      },
      r = performance.getEntriesByName("first-contentful-paint")[0],
      c = r ? null : S("paint", o);
    (r || c) &&
      ((i = m(e, n, t)),
      r && o(r),
      h(function (u) {
        (n = s("FCP")),
          (i = m(e, n, t)),
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              (n.value = performance.now() - u.timeStamp), p.add(n), i();
            });
          });
      }));
  },
  d = { passive: !0, capture: !0 },
  k = new Date(),
  b = function (e, t) {
    f || ((f = t), (l = e), (F = new Date()), P(removeEventListener), C());
  },
  C = function () {
    if (l >= 0 && l < F - k) {
      var e = {
        entryType: "first-input",
        name: f.type,
        target: f.target,
        cancelable: f.cancelable,
        startTime: f.timeStamp,
        processingStart: f.timeStamp + l,
      };
      g.forEach(function (t) {
        t(e);
      }),
        (g = []);
    }
  },
  D = function (e) {
    if (e.cancelable) {
      var t =
        (e.timeStamp > 1e12 ? new Date() : performance.now()) - e.timeStamp;
      e.type == "pointerdown"
        ? (function (i, a) {
            var n = function () {
                b(i, a), r();
              },
              o = function () {
                r();
              },
              r = function () {
                removeEventListener("pointerup", n, d),
                  removeEventListener("pointercancel", o, d);
              };
            addEventListener("pointerup", n, d),
              addEventListener("pointercancel", o, d);
          })(t, e)
        : b(t, e);
    }
  },
  P = function (e) {
    ["mousedown", "keydown", "touchstart", "pointerdown"].forEach(function (t) {
      return e(t, D, d);
    });
  },
  B = function (e, t) {
    var i,
      a = E(),
      n = s("FID"),
      o = function (c) {
        c.startTime < a.timeStamp &&
          ((n.value = c.processingStart - c.startTime),
          n.entries.push(c),
          p.add(n),
          i());
      },
      r = S("first-input", o);
    (i = m(e, n, t)),
      r &&
        y(function () {
          r.takeRecords().map(o), r.disconnect();
        }, !0),
      r &&
        h(function () {
          var c;
          (n = s("FID")),
            (i = m(e, n, t)),
            (g = []),
            (l = -1),
            (f = null),
            P(addEventListener),
            (c = o),
            g.push(c),
            C();
        });
  },
  I = function (e, t) {
    var i,
      a = E(),
      n = s("LCP"),
      o = function (u) {
        var L = u.startTime;
        L < a.timeStamp && ((n.value = L), n.entries.push(u)), i();
      },
      r = S("largest-contentful-paint", o);
    if (r) {
      i = m(e, n, t);
      var c = function () {
        p.has(n) || (r.takeRecords().map(o), r.disconnect(), p.add(n), i());
      };
      ["keydown", "click"].forEach(function (u) {
        addEventListener(u, c, { once: !0, capture: !0 });
      }),
        y(c, !0),
        h(function (u) {
          (n = s("LCP")),
            (i = m(e, n, t)),
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                (n.value = performance.now() - u.timeStamp), p.add(n), i();
              });
            });
        });
    }
  },
  R = function (e) {
    var t,
      i = s("TTFB");
    (t = function () {
      try {
        var a =
          performance.getEntriesByType("navigation")[0] ||
          (function () {
            var n = performance.timing,
              o = { entryType: "navigation", startTime: 0 };
            for (var r in n)
              r !== "navigationStart" &&
                r !== "toJSON" &&
                (o[r] = Math.max(n[r] - n.navigationStart, 0));
            return o;
          })();
        if (((i.value = i.delta = a.responseStart), i.value < 0)) return;
        (i.entries = [a]), e(i);
      } catch {}
    }),
      document.readyState === "complete"
        ? setTimeout(t, 0)
        : addEventListener("pageshow", t);
  };
export { q as getCLS, A as getFCP, B as getFID, I as getLCP, R as getTTFB };
