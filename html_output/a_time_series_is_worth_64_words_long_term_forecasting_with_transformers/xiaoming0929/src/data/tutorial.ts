import type { TutorialData } from '../types';

export const tutorial: TutorialData = {
  "meta": {
    "titleEn": "A Time Series is Worth 64 Words: Long-term Forecasting with Transformers",
    "titleZh": "一个时间序列胜过 64 个词：使用 Transformer 进行长期预测",
    "venue": "ICLR 2023",
    "authors": "Yuqi Nie · Nam H. Nguyen · Phanwadee Sinthong · Jayant Kalagnanam",
    "affiliation": "Princeton University · IBM Research",
    "domain": "多变量时间序列预测 · 自监督表示学习",
    "coreProblem": "逐点 token 既难表达局部乐句，又让长回看窗口的注意力成本呈二次增长。",
    "coreInsight": "PatchTST 把相邻时间点打包成 patch，并让每个通道独立前向、共享同一套 Transformer 权重，从而保留局部语义并看得更远。",
    "keywords": [
      "PatchTST",
      "patching",
      "通道独立",
      "长期预测",
      "掩码预训练"
    ]
  },
  "hero": {
    "oldMethod": {
      "desc": "逐点 token 堆满注意力，长窗口昂贵",
      "componentId": "patchtst-explorer"
    },
    "newMethod": {
      "desc": "局部 patch + 通道独立，共享骨干看得更远",
      "componentId": "patchtst-explorer"
    }
  },
  "chapters": [
    {
      "kind": "chapter",
      "id": "chap-1",
      "title": "先听见问题",
      "badge": "inf",
      "badgeLabel": "概念",
      "bridge": "先把长序列当成一页密集乐谱，看看逐点阅读为什么同时损失局部语义并放大注意力开销。",
      "analogy": {
        "title": "指挥棒找准目标音",
        "text": "一条长时间序列像一页密集乐谱；逐点读谱时，局部乐句被噪声淹没，目标音也更难找。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "1.1",
          "title": "逐点读谱的代价",
          "desc": "拖动回看窗口，观察逐点 token 如何让注意力二次膨胀。",
          "componentId": "patchtst-explorer"
        },
        {
          "kind": "module",
          "id": "1.2",
          "title": "打开补丁化",
          "desc": "在同一个窗口启用 patch，保留局部乐句同时缩短 token 序列。",
          "componentId": "patchtst-explorer"
        }
      ],
      "insight": "要保留更长历史，先要让每个 token 携带一小段乐句。",
      "formula": {
        "lead": "注意力图的二次项只依赖 token 数 N，而 patch 让 N 近似变成 L/S。",
        "unicode": "注意力代价 ∝ N²，N≈L/S",
        "symbols": [
          {
            "sym": "N",
            "desc": "patch token 的数量"
          },
          {
            "sym": "L",
            "desc": "回看窗口长度"
          },
          {
            "sym": "S",
            "desc": "patch 步长"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "瓶颈是 token",
          "desc": "长窗口的主要代价来自注意力对 token 数的二次依赖。"
        },
        {
          "icon": "🔧",
          "title": "先打包再阅读",
          "desc": "patch 把相邻时间点变成携带局部语义的输入单元。"
        },
        {
          "icon": "✨",
          "title": "收益有边界",
          "desc": "论文报告的运行时间倍数属于特定数据集和硬件协议。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-2",
      "title": "一小段才像一个词",
      "badge": "inf",
      "badgeLabel": "表示",
      "bridge": "知道 token 太多后，下一问是：一个 token 究竟应该携带多少个连续时间点？",
      "analogy": {
        "title": "框住一个乐句",
        "text": "拖动括号，把相邻时间点收成一个可辨认的乐句；括号越长，单个 token 携带的局部模式越多。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "2.1",
          "title": "拖动补丁括号",
          "desc": "直接拖动补丁长度和步长，观察 token 数与局部语义的折中。",
          "componentId": "patchtst-explorer"
        }
      ],
      "formula": {
        "lead": "论文在末值填充规则下计算补丁数。",
        "unicode": "N=⌊(L−P)/S⌋+2",
        "symbols": [
          {
            "sym": "P",
            "desc": "补丁长度"
          },
          {
            "sym": "S",
            "desc": "补丁步长"
          },
          {
            "sym": "N",
            "desc": "补丁数量"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "patch 是输入",
          "desc": "patch 在进入 Transformer 之前就已经是 token，而不是事后压缩。"
        },
        {
          "icon": "🔧",
          "title": "P 控粒度",
          "desc": "P 决定一个 token 看见多长的局部时间模式。"
        },
        {
          "icon": "✨",
          "title": "S 控重叠",
          "desc": "步长同时决定相邻 patch 的重叠程度和 token 数。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-3",
      "title": "通道各练各的，但用同一套方法",
      "badge": "inf",
      "badgeLabel": "洞见",
      "bridge": "patch 已经把局部模式打包，接下来处理多变量序列：不同通道是否必须挤进同一个 token？",
      "analogy": {
        "title": "分声部重放同一句",
        "text": "每个声部先独立听清自己的旋律，但都由同一位指挥使用同一套节拍规则。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "3.1",
          "title": "通道混合 vs 通道独立",
          "desc": "点击开始对比，让两条相同输入的前向路径同步显示。",
          "componentId": "patchtst-explorer"
        }
      ],
      "insight": "通道独立不是各自训练一套模型，而是独立前向、共享权重。",
      "formula": {
        "lead": "多变量输入先拆成 M 条单变量序列，再复用同一个骨干。",
        "unicode": "x∈R^{M×L} → {x⁽ⁱ⁾∈R^{1×L}}ᵢ₌₁ᴹ",
        "symbols": [
          {
            "sym": "M",
            "desc": "通道数量"
          },
          {
            "sym": "x⁽ⁱ⁾",
            "desc": "第 i 个通道的单变量序列"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "独立前向",
          "desc": "每个通道不把其他通道的值拼入自己的输入 token。"
        },
        {
          "icon": "🔧",
          "title": "共享权重",
          "desc": "所有通道仍使用同一套投影和 Transformer 参数。"
        },
        {
          "icon": "✨",
          "title": "明确边界",
          "desc": "作者把显式跨通道依赖建模留作后续方向。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-4",
      "title": "回看更远，成本仍可控",
      "badge": "both",
      "badgeLabel": "机制",
      "bridge": "通道策略确定后，回看窗口 L、补丁长度 P 和步长 S 如何共同决定可承受的历史范围？",
      "analogy": {
        "title": "量更长的乐谱",
        "text": "把回看窗口拉长能看到更早的节奏；步长决定要在谱上放多少个阅读标记。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "4.1",
          "title": "L、P、S 的折中",
          "desc": "调整三个参数，联动查看 token 数和归一化的 N² 成本。",
          "componentId": "patchtst-explorer"
        }
      ],
      "formula": {
        "lead": "token 数和注意力二次项把结构选择变成可计算的折中。",
        "unicode": "N=⌊(L−P)/S⌋+2；复杂度≈O(N²)",
        "symbols": [
          {
            "sym": "L",
            "desc": "回看窗口"
          },
          {
            "sym": "P",
            "desc": "patch 长度"
          },
          {
            "sym": "S",
            "desc": "stride"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "看得更远",
          "desc": "在相同资源约束下，较短 token 序列让更长历史成为可能。"
        },
        {
          "icon": "🔧",
          "title": "参数可解释",
          "desc": "P 和 S 分别控制局部粒度与 token 数，而不是黑盒旋钮。"
        },
        {
          "icon": "✨",
          "title": "别过度外推",
          "desc": "复杂度趋势是一般规律，具体运行倍数仍依赖实现和硬件。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-5",
      "title": "位置、投影与注意力",
      "badge": "both",
      "badgeLabel": "编码",
      "bridge": "patch 只是局部乐句，还需要知道它在整页乐谱的哪个位置，才能交给注意力比较。",
      "analogy": {
        "title": "标记第几小节",
        "text": "同样的乐句放在不同小节，含义不同；位置标记让编码器知道它来自哪里。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "5.1",
          "title": "从补丁到 Transformer",
          "desc": "点击三个阶段，沿着形状变化查看投影、位置编码和注意力入口。",
          "componentId": "patchtst-explorer"
        }
      ],
      "formula": {
        "lead": "论文把 patch 投影到 D 维，并加上可学习的位置编码。",
        "unicode": "x_d⁽ⁱ⁾=W_p x_p⁽ⁱ⁾+W_pos",
        "symbols": [
          {
            "sym": "W_p",
            "desc": "D×P 的补丁投影矩阵"
          },
          {
            "sym": "W_pos",
            "desc": "D×N 的位置编码"
          },
          {
            "sym": "D",
            "desc": "潜空间宽度"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "投影改宽度",
          "desc": "每个 patch 从 P 个点进入 D 维潜空间。"
        },
        {
          "icon": "🔧",
          "title": "位置保顺序",
          "desc": "相同局部模式在不同时间位置仍能被区分。"
        },
        {
          "icon": "✨",
          "title": "再交给注意力",
          "desc": "Transformer 看到的是带位置的 patch token。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-6",
      "title": "一步一步读到预测头",
      "badge": "inf",
      "badgeLabel": "推理",
      "bridge": "现在把论文图中的骨干拆成可检查的前向路线，看看一个通道如何走到未来 T 步。",
      "analogy": {
        "title": "按小节推进到未来",
        "text": "每按一次，指挥棒前进一个清晰阶段：归一化、补丁、编码，最后落到未来 T 步。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "6.1",
          "title": "前向路线",
          "desc": "按上一步、下一步或重置，逐段检查每个张量形状和输出。",
          "componentId": "patchtst-explorer"
        }
      ],
      "formula": {
        "lead": "监督版最终为每个通道输出 T 个未来值。",
        "unicode": "x̂⁽ⁱ⁾∈R^{1×T}",
        "symbols": [
          {
            "sym": "T",
            "desc": "预测长度"
          },
          {
            "sym": "z⁽ⁱ⁾",
            "desc": "D×N 的通道潜表示"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "逐通道预测",
          "desc": "每个通道有自己的输出序列，再拼回多变量预测。"
        },
        {
          "icon": "🔧",
          "title": "线性头收尾",
          "desc": "编码后的 D×N 表示展平后送入线性预测头。"
        },
        {
          "icon": "✨",
          "title": "顺序不可跳",
          "desc": "归一化、patch、编码和输出是同一条前向路径。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-7",
      "title": "遮住一小节，练出可迁移表示",
      "badge": "trn",
      "badgeLabel": "训练",
      "bridge": "监督预测之外，PatchTST 还可以先从无标签序列中学习表示；关键是遮住足够大的局部结构。",
      "analogy": {
        "title": "遮住一句再复原",
        "text": "遮住整段乐句而不是一个音符，模型必须利用更高层的节奏结构把它补回来。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "7.1",
          "title": "遮罩比例与重建",
          "desc": "调节遮罩比例并触发重建，观察补丁级缺口带来的训练压力。",
          "componentId": "patchtst-explorer"
        }
      ],
      "formula": {
        "lead": "自监督目标只在被遮补丁上计算重建误差。",
        "unicode": "L_mask=||x_mask−x̂_mask||²",
        "symbols": [
          {
            "sym": "x_mask",
            "desc": "被遮住的真实补丁"
          },
          {
            "sym": "x̂_mask",
            "desc": "模型重建的补丁"
          }
        ]
      },
      "takeaways": [
        {
          "icon": "🎯",
          "title": "遮住 patch",
          "desc": "补丁级遮罩比单点插值更需要整体表示。"
        },
        {
          "icon": "🔧",
          "title": "默认 40%",
          "desc": "论文自监督实验使用 40% 遮罩、长度 512、补丁 12。"
        },
        {
          "icon": "✨",
          "title": "表示可迁移",
          "desc": "预训练表示可线性探测，也可端到端微调。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-8",
      "title": "点击看清共享骨干",
      "badge": "trn",
      "badgeLabel": "结构",
      "bridge": "理解训练目标后，回到结构本身：哪些模块被所有通道复用，监督和自监督又在哪里分叉？",
      "analogy": {
        "title": "指挥同一套排练法",
        "text": "声部不同，但都经过同一套可检查的排练骨干；只在最后选择预测或重建出口。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "8.1",
          "title": "PatchTST 骨干地图",
          "desc": "点击节点或切换出口，让选中模块、张量形状和活动路径同步更新。",
          "componentId": "patchtst-explorer"
        }
      ],
      "takeaways": [
        {
          "icon": "🎯",
          "title": "骨干共享",
          "desc": "通道独立依靠同一套投影与 Transformer 参数保持效率。"
        },
        {
          "icon": "🔧",
          "title": "出口分叉",
          "desc": "监督预测头输出未来 T 步，自监督头重建 D×P 补丁。"
        },
        {
          "icon": "✨",
          "title": "结构要连着形状读",
          "desc": "点击节点时同时看路径和维度，避免把架构当成静态海报。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-9",
      "title": "看见鲁棒性与实现边界",
      "badge": "trn",
      "badgeLabel": "实践",
      "bridge": "方法听起来简洁，但真正的收益来自哪一项设计？消融和显存边界能防止我们过度归因。",
      "analogy": {
        "title": "擦掉一小节再检查",
        "text": "删掉一个局部乐句后，先看重建是否稳定，再决定是否保留这套排练设置。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "9.1",
          "title": "消融开关",
          "desc": "在固定数据集和预测长度下切换 P+CI、CI、P 与 Original，比较 Table 7 的 MSE。",
          "componentId": "patchtst-explorer"
        }
      ],
      "takeaways": [
        {
          "icon": "🎯",
          "title": "两项都重要",
          "desc": "Table 7 显示去掉 patch 或通道独立都会恶化结果。"
        },
        {
          "icon": "🔧",
          "title": "固定协议",
          "desc": "读消融必须同时固定数据集、预测长度和指标方向。"
        },
        {
          "icon": "✨",
          "title": "显存也是边界",
          "desc": "部分非通道独立配置在 A40 48GB、batch=1 时仍会 OOM。"
        }
      ]
    },
    {
      "kind": "chapter",
      "id": "chap-10",
      "title": "结果要按协议比较",
      "badge": "both",
      "badgeLabel": "证据",
      "bridge": "最后把模型放回论文的实验协议：同一数据集、预测长度和指标方向下，结果才有可比性。",
      "analogy": {
        "title": "同一终点线下比速度",
        "text": "只有把预测长度、数据集和指标写在同一张谱面上，快慢才可比较。",
        "componentId": "patchtst-explorer"
      },
      "modules": [
        {
          "kind": "module",
          "id": "10.1",
          "title": "Table 3 / Table 6 结果赛",
          "desc": "点击开始，在两个严格分开的论文协议之间切换，查看真实 MSE 数值和限制。",
          "componentId": "patchtst-explorer"
        }
      ],
      "takeaways": [
        {
          "icon": "🎯",
          "title": "广泛优于基线",
          "desc": "论文报告 PatchTST 在多个长期预测基准上取得更低 MSE/MAE。"
        },
        {
          "icon": "🔧",
          "title": "迁移要写清楚",
          "desc": "Table 6 的 transferred 列先在 Traffic 预训练，再迁移到 ETTh1。"
        },
        {
          "icon": "✨",
          "title": "开放问题",
          "desc": "跨通道依赖如何显式建模，仍是作者提出的未来工作。"
        }
      ]
    }
  ],
  "bilibili": [
    {
      "bvid": "BV1QM41157yM",
      "title": "论文阅读：A TIME SERIES IS WORTH 64 WORDS LONG-TERM FORECASTING WITH TRANSFORMERS",
      "reason": "直接阅读原论文，适合建立全局结构"
    },
    {
      "bvid": "BV1A1DHBfEGq",
      "title": "04-时间序列Patch TST模型论文和代码讲解",
      "reason": "结合论文与代码讲解 PatchTST"
    },
    {
      "bvid": "BV1vT42167rh",
      "title": "深度学习｜补丁时间序列预测 PatchTST 即插即用模块",
      "reason": "聚焦补丁时间序列机制"
    }
  ]
};
