import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaFilePdf,
  FaImage,
  FaCheckDouble,
  FaSpinner,
  FaVideo,
  FaShieldAlt,
} from "react-icons/fa";

/*
|--------------------------------------------------------------------------
| TalkSphere Certificate
|--------------------------------------------------------------------------
| Permanent Founder Identity
|--------------------------------------------------------------------------
*/

const FOUNDER_NAME = "Er Shekh Basir";
const FOUNDER_TITLE = "Founder, TalkSphere";
const FOUNDER_SIGNATURE = "S. Basir";

function CertificatePreview({ certificate }) {
  const certRef = useRef(null);

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [exporting, setExporting] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Verification URL
  |--------------------------------------------------------------------------
  */

  const verifyUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;

  /*
  |--------------------------------------------------------------------------
  | QR CODE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    QRCode.toDataURL(verifyUrl, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: "H",
      color: {
        dark: "#07111F",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (mounted) {
          setQrDataUrl(url);
        }
      })
      .catch((error) => {
        console.error("QR generation failed:", error);

        if (mounted) {
          setQrDataUrl("");
        }
      });

    return () => {
      mounted = false;
    };
  }, [verifyUrl]);

  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  const formattedDate = new Date(certificate.meetingDate).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  /*
  |--------------------------------------------------------------------------
  | DURATION
  |--------------------------------------------------------------------------
  */

  const formattedDuration =
    Number(certificate.durationMinutes) >= 60
      ? `${Math.floor(Number(certificate.durationMinutes) / 60)}h ${
          Number(certificate.durationMinutes) % 60
        }m`
      : `${Number(certificate.durationMinutes) || 0} min`;

  /*
  |--------------------------------------------------------------------------
  | SAFE TEXT
  |--------------------------------------------------------------------------
  */

  const participantName =
    certificate?.participantName?.trim() || "Certificate Recipient";

  const meetingTitle =
    certificate?.meetingTitle?.trim() || "TalkSphere Live Session";

  const hostName = certificate?.hostName?.trim() || "TalkSphere Host";

  const description = certificate?.description?.trim() || "";

  /*
  |--------------------------------------------------------------------------
  | CAPTURE CERTIFICATE
  |--------------------------------------------------------------------------
  |
  | Important:
  | We intentionally use safe HEX/RGB colors in the certificate.
  | This prevents html2canvas errors related to oklab()/oklch().
  |
  */

  const captureCanvas = async () => {
    if (!certRef.current) {
      throw new Error("Certificate element not found");
    }

    if (document.fonts?.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // Ignore font loading errors.
      }
    }

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    const original = certRef.current;

    /*
    |--------------------------------------------------------------------------
    | Clone certificate
    |--------------------------------------------------------------------------
    */

    const clone = original.cloneNode(true);

    /*
    |--------------------------------------------------------------------------
    | Export dimensions
    |--------------------------------------------------------------------------
    */

    const width = original.offsetWidth || 1200;
    const height = original.offsetHeight || 848;

    /*
    |--------------------------------------------------------------------------
    | Isolated wrapper
    |--------------------------------------------------------------------------
    */

    const wrapper = document.createElement("div");

    wrapper.style.position = "fixed";
    wrapper.style.left = "-100000px";
    wrapper.style.top = "0";
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    wrapper.style.backgroundColor = "#FFFFFF";
    wrapper.style.overflow = "hidden";
    wrapper.style.zIndex = "-999999";
    wrapper.style.pointerEvents = "none";

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      /*
      |--------------------------------------------------------------------------
      | Make clone export-safe
      |--------------------------------------------------------------------------
      */

      const allElements = [clone, ...clone.querySelectorAll("*")];

      allElements.forEach((element) => {
        /*
        | Remove effects which can cause html2canvas issues.
        */

        element.style.setProperty("filter", "none", "important");

        element.style.setProperty("backdrop-filter", "none", "important");

        element.style.setProperty(
          "-webkit-backdrop-filter",
          "none",
          "important",
        );

        /*
        | Safe background.
        */

        if (element.dataset.exportGradient === "remove") {
          element.style.setProperty("background-image", "none", "important");
        }

        /*
        | Avoid CSS text clipping effects.
        */

        element.style.setProperty(
          "-webkit-text-fill-color",
          "initial",
          "important",
        );
      });

      /*
      |--------------------------------------------------------------------------
      | Root
      |--------------------------------------------------------------------------
      */

      clone.style.setProperty("background-color", "#FFFFFF", "important");

      /*
      |--------------------------------------------------------------------------
      | Images
      |--------------------------------------------------------------------------
      */

      const images = clone.querySelectorAll("img");

      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }),
      );

      await new Promise((resolve) => setTimeout(resolve, 250));

      /*
      |--------------------------------------------------------------------------
      | html2canvas
      |--------------------------------------------------------------------------
      */

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
        logging: false,
        imageTimeout: 15000,
        foreignObjectRendering: false,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
      });

      return canvas;
    } finally {
      wrapper.remove();
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD PNG
  |--------------------------------------------------------------------------
  */

  const downloadPNG = async () => {
    if (exporting) return;

    try {
      setExporting(true);

      const canvas = await captureCanvas();

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) {
              resolve(result);
            } else {
              reject(new Error("PNG blob creation failed"));
            }
          },
          "image/png",
          1,
        );
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${certificate.certificateId}.png`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (error) {
      console.error("PNG download failed:", error);

      alert(
        `Certificate PNG download failed.\n\n${
          error?.message || "Please try again."
        }`,
      );
    } finally {
      setExporting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD PDF
  |--------------------------------------------------------------------------
  */

  const downloadPDF = async () => {
    if (exporting) return;

    try {
      setExporting(true);

      const canvas = await captureCanvas();

      const imgData = canvas.toDataURL("image/png", 1);

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
        compress: true,
      });

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        canvas.width,
        canvas.height,
        undefined,
        "FAST",
      );

      pdf.save(`${certificate.certificateId}.pdf`);
    } catch (error) {
      console.error("PDF download failed:", error);

      alert(
        `Certificate PDF download failed.\n\n${
          error?.message || "Please try again."
        }`,
      );
    } finally {
      setExporting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="w-full">
      {/* =========================================================
          CERTIFICATE PREVIEW
      ========================================================== */}

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#050816",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        }}
      >
        <div
          ref={certRef}
          className="relative mx-auto"
          style={{
            width: "1000px",
            maxWidth: "100%",
            aspectRatio: "1.414 / 1",
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
            color: "#0F172A",
            fontFamily: "Inter, Arial, Helvetica, sans-serif",
          }}
        >
          {/* =====================================================
              PREMIUM BACKGROUND
          ====================================================== */}

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundColor: "#FFFFFF",
              backgroundImage:
                "radial-gradient(circle at 15% 20%, rgba(37,99,235,0.07), transparent 28%), radial-gradient(circle at 85% 80%, rgba(34,211,238,0.05), transparent 25%)",
            }}
            data-export-gradient="keep"
          />

          {/* =====================================================
              TOP NAVY BRAND BAND
          ====================================================== */}

          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: "9px",
              backgroundColor: "#07111F",
            }}
          />

          {/* =====================================================
              LARGE TALKSPHERE WATERMARK
          ====================================================== */}

          <div
            className="absolute pointer-events-none"
            style={{
              width: "460px",
              height: "460px",
              right: "-130px",
              top: "150px",
              borderRadius: "50%",
              border: "1px solid rgba(37,99,235,0.055)",
            }}
          />

          <div
            className="absolute pointer-events-none"
            style={{
              width: "390px",
              height: "390px",
              right: "-95px",
              top: "185px",
              borderRadius: "50%",
              border: "1px solid rgba(37,99,235,0.045)",
            }}
          />

          <div
            className="absolute pointer-events-none flex items-center justify-center"
            style={{
              width: "260px",
              height: "260px",
              right: "25px",
              top: "250px",
              borderRadius: "50%",
              border: "1px solid rgba(37,99,235,0.035)",
            }}
          >
            <div
              style={{
                width: "105px",
                height: "105px",
                borderRadius: "30px",
                border: "1px solid rgba(37,99,235,0.04)",
              }}
            />
          </div>

          {/* =====================================================
              OUTER BORDER
          ====================================================== */}

          <div
            className="absolute pointer-events-none"
            style={{
              inset: "20px",
              border: "1.5px solid #C9A34D",
            }}
          />

          {/* =====================================================
              INNER BORDER
          ====================================================== */}

          <div
            className="absolute pointer-events-none"
            style={{
              inset: "27px",
              border: "1px solid rgba(201,163,77,0.55)",
            }}
          />

          {/* =====================================================
              CORNER DETAILS
          ====================================================== */}

          <div
            className="absolute"
            style={{
              top: "27px",
              left: "27px",
              width: "38px",
              height: "38px",
              borderTop: "2px solid #2563EB",
              borderLeft: "2px solid #2563EB",
            }}
          />

          <div
            className="absolute"
            style={{
              top: "27px",
              right: "27px",
              width: "38px",
              height: "38px",
              borderTop: "2px solid #2563EB",
              borderRight: "2px solid #2563EB",
            }}
          />

          <div
            className="absolute"
            style={{
              bottom: "27px",
              left: "27px",
              width: "38px",
              height: "38px",
              borderBottom: "2px solid #2563EB",
              borderLeft: "2px solid #2563EB",
            }}
          />

          <div
            className="absolute"
            style={{
              bottom: "27px",
              right: "27px",
              width: "38px",
              height: "38px",
              borderBottom: "2px solid #2563EB",
              borderRight: "2px solid #2563EB",
            }}
          />

          {/* =====================================================
              CONTENT
          ====================================================== */}

          <div
            className="relative h-full flex flex-col"
            style={{
              padding: "58px 72px 48px",
            }}
          >
            {/* ===================================================
                BRAND HEADER
            ==================================================== */}

            <div className="flex items-center justify-between">
              {/* Brand */}

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    backgroundColor: "#2563EB",
                    border: "1px solid #1D4ED8",
                    boxShadow: "0 8px 20px rgba(37,99,235,0.20)",
                  }}
                >
                  <FaVideo
                    size={20}
                    style={{
                      color: "#FFFFFF",
                    }}
                  />
                </div>

                <div className="text-left">
                  <div
                    style={{
                      fontSize: "20px",
                      lineHeight: "1",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      color: "#0F172A",
                    }}
                  >
                    TALKSPHERE
                  </div>

                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "8px",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      color: "#64748B",
                    }}
                  >
                    Stacked & Built by Basir
                  </div>
                </div>
              </div>

              {/* Certificate ID */}

              <div className="text-right">
                <div
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    letterSpacing: "0.2em",
                    color: "#94A3B8",
                    textTransform: "uppercase",
                  }}
                >
                  Certificate ID
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#1E293B",
                  }}
                >
                  {certificate.certificateId}
                </div>
              </div>
            </div>

            {/* ===================================================
                MAIN CERTIFICATE AREA
            ==================================================== */}

            <div
              className="flex-1 flex flex-col items-center justify-center text-center"
              style={{
                paddingTop: "20px",
                paddingBottom: "20px",
              }}
            >
              {/* Small overline */}

              <div className="flex items-center gap-4">
                <div
                  style={{
                    width: "42px",
                    height: "1px",
                    backgroundColor: "#C9A34D",
                  }}
                />

                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.38em",
                    textTransform: "uppercase",
                    color: "#B28A3A",
                  }}
                >
                  TalkSphere Recognition
                </span>

                <div
                  style={{
                    width: "42px",
                    height: "1px",
                    backgroundColor: "#C9A34D",
                  }}
                />
              </div>

              {/* Main title */}

              <h1
                style={{
                  marginTop: "13px",
                  marginBottom: "0",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "29px",
                  lineHeight: "1.1",
                  letterSpacing: "0.13em",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#0B1220",
                }}
              >
                Certificate of Participation
              </h1>

              {/* Gold divider */}

              <div
                style={{
                  marginTop: "12px",
                  width: "100px",
                  height: "2px",
                  backgroundColor: "#C9A34D",
                }}
              />

              {/* Recipient intro */}

              <p
                style={{
                  marginTop: "17px",
                  marginBottom: "0",
                  fontSize: "12px",
                  color: "#64748B",
                  letterSpacing: "0.04em",
                }}
              >
                This certificate is proudly presented to
              </p>

              {/* Participant name */}

              <h2
                style={{
                  marginTop: "8px",
                  marginBottom: "0",
                  maxWidth: "800px",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "38px",
                  lineHeight: "1.15",
                  fontWeight: 700,
                  color: "#07111F",
                }}
              >
                {participantName}
              </h2>

              {/* Name underline */}

              <div
                style={{
                  marginTop: "8px",
                  width: "180px",
                  height: "1px",
                  backgroundColor: "#C9A34D",
                  opacity: 0.7,
                }}
              />

              {/* Statement */}

              <p
                style={{
                  maxWidth: "690px",
                  marginTop: "14px",
                  marginBottom: "0",
                  fontSize: "12px",
                  lineHeight: "1.75",
                  color: "#475569",
                }}
              >
                for successfully participating in
                <br />
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "4px",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {meetingTitle}
                </span>
              </p>

              {description && (
                <p
                  style={{
                    maxWidth: "650px",
                    marginTop: "6px",
                    marginBottom: "0",
                    fontSize: "10px",
                    lineHeight: "1.5",
                    color: "#64748B",
                  }}
                >
                  {description}
                </p>
              )}

              <p
                style={{
                  marginTop: "7px",
                  marginBottom: "0",
                  fontSize: "10px",
                  color: "#64748B",
                }}
              >
                Hosted on TalkSphere by{" "}
                <strong
                  style={{
                    color: "#1E293B",
                  }}
                >
                  {hostName}
                </strong>
              </p>
            </div>

            {/* ===================================================
                BOTTOM SECTION
            ==================================================== */}

            <div
              style={{
                borderTop: "1px solid rgba(201,163,77,0.35)",
                paddingTop: "17px",
              }}
            >
              <div
                className="grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 0.75fr 1fr 1.35fr",
                  gap: "22px",
                  alignItems: "end",
                }}
              >
                {/* =================================================
                    METADATA
                ================================================== */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px 18px",
                    textAlign: "left",
                  }}
                >
                  {/* Date */}

                  <div>
                    <div
                      style={{
                        fontSize: "7px",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        color: "#94A3B8",
                        textTransform: "uppercase",
                      }}
                    >
                      Date
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontSize: "9px",
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      {formattedDate}
                    </div>
                  </div>

                  {/* Duration */}

                  <div>
                    <div
                      style={{
                        fontSize: "7px",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        color: "#94A3B8",
                        textTransform: "uppercase",
                      }}
                    >
                      Duration
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontSize: "9px",
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      {formattedDuration}
                    </div>
                  </div>

                  {/* Room ID */}

                  <div>
                    <div
                      style={{
                        fontSize: "7px",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        color: "#94A3B8",
                        textTransform: "uppercase",
                      }}
                    >
                      Room ID
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        fontSize: "8px",
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      {certificate.roomId}
                    </div>
                  </div>

                  {/* Certificate ID */}

                  <div>
                    <div
                      style={{
                        fontSize: "7px",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        color: "#94A3B8",
                        textTransform: "uppercase",
                      }}
                    >
                      Certificate ID
                    </div>

                    <div
                      style={{
                        marginTop: "3px",
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                        fontSize: "8px",
                        fontWeight: 700,
                        color: "#334155",
                      }}
                    >
                      {certificate.certificateId}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    QR VERIFICATION
                ================================================== */}

                <div
                  className="text-center"
                  style={{
                    minWidth: "95px",
                  }}
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="TalkSphere certificate verification QR"
                      style={{
                        display: "block",
                        width: "70px",
                        height: "70px",
                        margin: "0 auto",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        margin: "0 auto",
                        border: "1px solid #CBD5E1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "8px",
                        color: "#94A3B8",
                      }}
                    >
                      QR
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "7px",
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      color: "#64748B",
                    }}
                  >
                    SCAN TO VERIFY
                  </div>
                </div>

                {/* =================================================
                    HOST SIGNATURE
                ================================================== */}

                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        fontSize: "17px",
                        fontStyle: "italic",
                        color: "#16233A",
                      }}
                    >
                      {hostName}
                    </span>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      width: "125px",
                      margin: "0 auto",
                      backgroundColor: "#C9A34D",
                    }}
                  />

                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "7px",
                      fontWeight: 700,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#94A3B8",
                    }}
                  >
                    Host / Instructor
                  </div>
                </div>

                {/* =================================================
                    FOUNDER SIGNATURE
                ================================================== */}

                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      height: "30px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: "1px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "'Brush Script MT', 'Segoe Script', cursive",
                        fontSize: "24px",
                        fontStyle: "italic",
                        color: "#07111F",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {FOUNDER_SIGNATURE}
                    </span>
                  </div>

                  <div
                    style={{
                      height: "1px",
                      width: "145px",
                      margin: "0 auto",
                      backgroundColor: "#C9A34D",
                    }}
                  />

                  <div
                    style={{
                      marginTop: "5px",
                      fontSize: "8px",
                      fontWeight: 800,
                      color: "#1E293B",
                    }}
                  >
                    {FOUNDER_NAME}
                  </div>

                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "7px",
                      fontWeight: 700,
                      letterSpacing: "0.13em",
                      textTransform: "uppercase",
                      color: "#94A3B8",
                    }}
                  >
                    {FOUNDER_TITLE}
                  </div>
                </div>
              </div>

              {/* =================================================
                  VERIFICATION FOOTER
              ================================================== */}

              <div
                className="flex items-center justify-center"
                style={{
                  marginTop: "12px",
                  gap: "7px",
                  fontSize: "7px",
                  color: "#64748B",
                }}
              >
                <FaShieldAlt
                  size={8}
                  style={{
                    color: "#2563EB",
                  }}
                />

                <span>
                  Digitally Verified by{" "}
                  <strong
                    style={{
                      color: "#1E293B",
                    }}
                  >
                    TalkSphere
                  </strong>
                </span>

                <span
                  style={{
                    color: "#C9A34D",
                  }}
                >
                  •
                </span>

                <span>Scan QR to verify authenticity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          DOWNLOAD BUTTONS
      ========================================================== */}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {/* PNG */}

        <button
          type="button"
          onClick={downloadPNG}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-slate-200 hover:border-cyan-400/50 hover:bg-white/[0.08] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <FaSpinner size={13} className="animate-spin" />
          ) : (
            <FaImage size={13} />
          )}

          {exporting ? "Preparing..." : "Download PNG"}
        </button>

        {/* PDF */}

        <button
          type="button"
          onClick={downloadPDF}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-[#05070d] bg-gradient-to-r from-cyan-300 to-violet-300 hover:shadow-[0_0_25px_-5px_rgba(34,211,238,0.6)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <FaSpinner size={13} className="animate-spin" />
          ) : (
            <FaFilePdf size={13} />
          )}

          {exporting ? "Preparing..." : "Download PDF"}
        </button>
      </div>

      {/* =========================================================
          VERIFICATION LINK
      ========================================================== */}

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <FaCheckDouble className="text-emerald-400" size={11} />

        <span>Verifiable at</span>

        <a
          href={verifyUrl}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-300 hover:underline break-all"
        >
          {verifyUrl.replace(/^https?:\/\//, "")}
        </a>
      </p>
    </div>
  );
}

export default CertificatePreview;
