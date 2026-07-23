import { ImageResponse } from "next/og";

export const alt =
  "Expense AI — smart expense tracking, budgets, and financial insights";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e6edf3",
          background:
            "radial-gradient(circle at 70% 20%, #183b2a 0, #0b0f14 48%)",
          padding: "64px",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: "680px", display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#4ade80",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              EXPENSE AI
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.03,
                letterSpacing: -3,
              }}
            >
              Your spending, finally clear.
            </div>
            <div
              style={{
                marginTop: 28,
                color: "#9aa8b9",
                fontSize: 27,
                lineHeight: 1.35,
              }}
            >
              Track expenses in plain language. Follow budgets. Understand your
              money.
            </div>
          </div>

          <div
            style={{
              width: 300,
              height: 380,
              display: "flex",
              flexDirection: "column",
              border: "1px solid #2b3946",
              borderRadius: 32,
              background: "#141b24",
              padding: 28,
              boxShadow: "0 25px 70px rgba(0,0,0,.4)",
            }}
          >
            <div style={{ color: "#8b98a9", fontSize: 18 }}>
              Current balance
            </div>
            <div style={{ marginTop: 12, fontSize: 42, fontWeight: 800 }}>
              $8,420
            </div>
            <div
              style={{
                marginTop: 32,
                display: "flex",
                height: 130,
                alignItems: "flex-end",
                gap: 12,
              }}
            >
              {[54, 82, 67, 100, 76].map((height, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flex: 1,
                    height: `${height}%`,
                    borderRadius: "8px 8px 0 0",
                    background: "#4ade80",
                    opacity: 0.75,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                marginTop: 28,
                display: "flex",
                borderRadius: 14,
                background: "#173025",
                color: "#9ff2ba",
                padding: "14px 16px",
                fontSize: 17,
              }}
            >
              Spending down 14% this month
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
