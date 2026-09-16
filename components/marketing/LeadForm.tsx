"use client";

import { useCallback, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { leadSchema, type LeadInput, PROPERTY_TYPES, LEAD_TOPICS } from "@/lib/lead-schema";
import { whatsappLink } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import {
  EMPTY_ROOF_ESTIMATE,
  RoofMapPlanner,
  type RoofEstimate,
} from "./RoofMapPlanner";
import styles from "./LeadForm.module.scss";

function Field({
  label,
  optional,
  error,
  children,
}: {
  label: string;
  optional?: string;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        {optional ? <em className={styles.opt}>{optional}</em> : null}
      </span>
      {children}
      {error}
    </label>
  );
}

export function LeadForm({
  defaultCity,
  defaultBill,
  defaultProduct,
  defaultTopic,
  googleMapsApiKey,
}: {
  defaultCity?: string;
  defaultBill?: string;
  /** Catalog group name/slug carried over from a product card CTA. */
  defaultProduct?: string;
  /** Routing topic carried over from a section CTA (?konu=...). */
  defaultTopic?: string;
  /** Public, HTTP-referrer-restricted browser key used for address search and the roof map. */
  googleMapsApiKey?: string;
}) {
  const t = useTranslations("Contact");
  const locale = useLocale();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [token, setToken] = useState("");
  const [roofEstimate, setRoofEstimate] = useState<RoofEstimate>(EMPTY_ROOF_ESTIMATE);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: defaultCity ?? "",
      bill: defaultBill ?? "",
      message: defaultProduct ? t("form.productMessage", { product: defaultProduct }) : "",
      product: defaultProduct ?? "",
      topic: (LEAD_TOPICS as readonly string[]).includes(defaultTopic ?? "")
        ? (defaultTopic as LeadInput["topic"])
        : undefined,
      consent: false,
      company: "",
    },
  });

  const city = useWatch({ control, name: "city" });

  const updateRoofEstimate = useCallback((updates: Partial<RoofEstimate>) => {
    setRoofEstimate((current) => ({ ...current, ...updates }));
  }, []);

  async function goToRoofStep() {
    const valid = await trigger([
      "name",
      "phone",
      "email",
      "city",
      "propertyType",
      "topic",
      "bill",
      "message",
    ]);
    if (!valid) return;
    setStep(2);
    window.requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }

  function handleFirstStepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void goToRoofStep();
  }

  function goToSummaryStep() {
    setStatus("idle");
    setStep(3);
    window.requestAnimationFrame(() => stepHeadingRef.current?.focus());
  }

  function handleRoofStepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goToSummaryStep();
  }

  async function onSubmit(values: LeadInput) {
    setStatus("idle");
    if (siteKey && !token) {
      setStatus("error");
      return;
    }
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          token,
          roofAddress: roofEstimate.address || undefined,
          roofCoordinates: roofEstimate.coordinates.length
            ? roofEstimate.coordinates
            : undefined,
          roofAreaM2: roofEstimate.roofAreaM2 || undefined,
          panelCount: roofEstimate.panelCount || undefined,
          systemKwp: roofEstimate.systemKwp || undefined,
          annualProductionKwh: roofEstimate.annualProductionKwh || undefined,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      reset();
      setRoofEstimate(EMPTY_ROOF_ESTIMATE);
      setStep(1);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}>
          <IconCheck size={28} />
        </span>
        <h3 className={styles.successTitle}>{t("success.title")}</h3>
        <p className={styles.successDesc}>{t("success.desc")}</p>
      </div>
    );
  }

  const fieldError = (k: keyof LeadInput) =>
    errors[k] ? <span className={styles.err}>{t(`errors.${k}`)}</span> : null;
  const summaryValues = getValues();
  const notProvided = t("summary.notProvided");

  return (
    <form
      className={styles.form}
      onSubmit={
        step === 1
          ? handleFirstStepSubmit
          : step === 2
            ? handleRoofStepSubmit
            : handleSubmit(onSubmit)
      }
      noValidate
    >
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.hp}
        {...register("company")}
      />
      <input type="hidden" {...register("product")} />

      <div className={styles.steps} aria-label={t("steps.label")}>
        <button
          type="button"
          className={clsx(
            styles.step,
            step === 1 && styles.stepActive,
            step > 1 && styles.stepComplete,
          )}
          onClick={() => setStep(1)}
          aria-current={step === 1 ? "step" : undefined}
        >
          <span>1</span>
          {t("steps.details")}
        </button>
        <span
          className={clsx(styles.stepLine, step > 1 && styles.stepLineComplete)}
          aria-hidden="true"
        />
        <button
          type="button"
          className={clsx(
            styles.step,
            step === 2 && styles.stepActive,
            step > 2 && styles.stepComplete,
          )}
          onClick={() => {
            if (step > 1) setStep(2);
          }}
          disabled={step === 1}
          aria-current={step === 2 ? "step" : undefined}
        >
          <span>2</span>
          {t("steps.roof")}
        </button>
        <span
          className={clsx(styles.stepLine, step > 2 && styles.stepLineComplete)}
          aria-hidden="true"
        />
        <div
          className={clsx(styles.step, step === 3 && styles.stepActive)}
          aria-current={step === 3 ? "step" : undefined}
        >
          <span>3</span>
          {t("steps.summary")}
        </div>
      </div>

      <h2 ref={stepHeadingRef} tabIndex={-1} className="sr-only">
        {step === 1
          ? t("steps.details")
          : step === 2
            ? t("steps.roof")
            : t("steps.summary")}
      </h2>

      {step === 1 ? (
        <div className={styles.stepPanel}>
          <div className={styles.row2}>
            <Field label={t("form.name")} error={fieldError("name")}>
              <input
                {...register("name")}
                className={clsx(styles.input, errors.name && styles.invalid)}
                placeholder={t("form.namePh")}
                autoComplete="name"
              />
            </Field>
            <Field label={t("form.phone")} error={fieldError("phone")}>
              <input
                {...register("phone")}
                className={clsx(styles.input, errors.phone && styles.invalid)}
                placeholder="05xx xxx xx xx"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
          </div>

          <div className={styles.row2}>
            <Field label={t("form.email")} error={fieldError("email")}>
              <input
                {...register("email")}
                type="email"
                className={clsx(styles.input, errors.email && styles.invalid)}
                placeholder="ornek@eposta.com"
                autoComplete="email"
              />
            </Field>
            <Field label={t("form.city")} error={fieldError("city")}>
              <input
                {...register("city")}
                className={clsx(styles.input, errors.city && styles.invalid)}
                placeholder={t("form.cityPh")}
                autoComplete="address-level2"
              />
            </Field>
          </div>

          <Field label={t("form.topic")}>
            <select {...register("topic")} className={styles.input}>
              <option value="">{t("form.topicPlaceholder")}</option>
              {LEAD_TOPICS.map((v) => (
                <option key={v} value={v}>
                  {t(`form.topics.${v}`)}
                </option>
              ))}
            </select>
          </Field>

          <div className={styles.row2}>
            <Field label={t("form.propertyType")} error={fieldError("propertyType")}>
              <select
                {...register("propertyType")}
                className={clsx(styles.input, errors.propertyType && styles.invalid)}
              >
                <option value="">{t("form.propertyPh")}</option>
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {t(`form.property.${pt}`)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("form.bill")} optional={t("form.optional")}>
              <input
                {...register("bill")}
                className={styles.input}
                placeholder="1500"
                inputMode="numeric"
              />
            </Field>
          </div>

          <Field label={t("form.message")} optional={t("form.optional")}>
            <textarea
              {...register("message")}
              className={clsx(styles.input, styles.textarea)}
              rows={4}
              placeholder={t("form.messagePh")}
            />
          </Field>

          <div className={styles.actions}>
            <button type="button" className={styles.submit} onClick={() => void goToRoofStep()}>
              {t("form.next")}
              <IconArrowRight size={18} />
            </button>
            <a
              href={whatsappLink(t("whatsappMessage"))}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsapp}
            >
              {t("form.whatsapp")}
            </a>
          </div>
        </div>
      ) : step === 2 ? (
        <div className={styles.stepPanel}>
          <RoofMapPlanner
            apiKey={googleMapsApiKey}
            locale={locale}
            city={city}
            value={roofEstimate}
            onChange={updateRoofEstimate}
          />

          <div className={clsx(styles.actions, styles.finalActions)}>
            <button type="button" className={styles.back} onClick={() => setStep(1)}>
              {t("form.back")}
            </button>
            <button type="button" className={styles.submit} onClick={goToSummaryStep}>
              {t("form.toSummary")}
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.stepPanel}>
          <section className={styles.summary} aria-labelledby="quote-summary-title">
            <div className={styles.summaryHeading}>
              <div>
                <h3 id="quote-summary-title">{t("summary.title")}</h3>
                <p>{t("summary.intro")}</p>
              </div>
              <button type="button" onClick={() => setStep(1)}>
                {t("summary.editDetails")}
              </button>
            </div>

            <h4 className={styles.summaryGroupTitle}>{t("summary.contactTitle")}</h4>
            <dl className={styles.summaryGrid}>
              <div>
                <dt>{t("form.name")}</dt>
                <dd>{summaryValues.name || notProvided}</dd>
              </div>
              <div>
                <dt>{t("form.phone")}</dt>
                <dd>{summaryValues.phone || notProvided}</dd>
              </div>
              <div>
                <dt>{t("form.email")}</dt>
                <dd>{summaryValues.email || notProvided}</dd>
              </div>
              <div>
                <dt>{t("form.city")}</dt>
                <dd>{summaryValues.city || notProvided}</dd>
              </div>
              <div>
                <dt>{t("form.topic")}</dt>
                <dd>
                  {summaryValues.topic
                    ? t(`form.topics.${summaryValues.topic}`)
                    : notProvided}
                </dd>
              </div>
              <div>
                <dt>{t("form.propertyType")}</dt>
                <dd>
                  {summaryValues.propertyType
                    ? t(`form.property.${summaryValues.propertyType}`)
                    : notProvided}
                </dd>
              </div>
              <div>
                <dt>{t("form.bill")}</dt>
                <dd>{summaryValues.bill ? `${summaryValues.bill} ₺` : notProvided}</dd>
              </div>
              <div className={styles.summaryWide}>
                <dt>{t("form.message")}</dt>
                <dd>{summaryValues.message || notProvided}</dd>
              </div>
            </dl>

            <h4 className={styles.summaryGroupTitle}>{t("summary.roofTitle")}</h4>
            {roofEstimate.address || roofEstimate.coordinates.length ? (
              <dl className={styles.summaryGrid}>
                <div className={styles.summaryWide}>
                  <dt>{t("map.addressLabel")}</dt>
                  <dd>{roofEstimate.address || notProvided}</dd>
                </div>
                <div>
                  <dt>{t("map.roofArea")}</dt>
                  <dd>{roofEstimate.roofAreaM2.toLocaleString(locale, { maximumFractionDigits: 1 })} m²</dd>
                </div>
                <div>
                  <dt>{t("map.panelCount")}</dt>
                  <dd>{roofEstimate.panelCount}</dd>
                </div>
                <div>
                  <dt>{t("map.systemPower")}</dt>
                  <dd>{roofEstimate.systemKwp.toLocaleString(locale, { maximumFractionDigits: 1 })} kWp</dd>
                </div>
                <div>
                  <dt>{t("map.annualProduction")}</dt>
                  <dd>≈ {Math.round(roofEstimate.annualProductionKwh).toLocaleString(locale)} kWh</dd>
                </div>
              </dl>
            ) : (
              <p className={styles.summaryEmpty}>{t("summary.roofEmpty")}</p>
            )}
          </section>

          <label className={styles.consent}>
            <input type="checkbox" {...register("consent")} />
            <span>
              {t.rich("form.consent", {
                link: (chunks) => (
                  <Link href="/privacy" target="_blank" rel="noopener noreferrer">
                    {chunks}
                  </Link>
                ),
              })}
            </span>
          </label>
          {errors.consent ? <span className={styles.err}>{t("errors.consent")}</span> : null}

          {siteKey ? (
            <div className={styles.turnstile}>
              <Turnstile
                siteKey={siteKey}
                onSuccess={setToken}
                onError={() => setToken("")}
                onExpire={() => setToken("")}
                options={{ theme: "auto" }}
              />
            </div>
          ) : null}

          {status === "error" ? <p className={styles.formError}>{t("error.desc")}</p> : null}

          <div className={clsx(styles.actions, styles.finalActions)}>
            <button type="button" className={styles.back} onClick={() => setStep(2)}>
              {t("form.backToRoof")}
            </button>
            <button type="submit" className={styles.submit} disabled={isSubmitting}>
              {isSubmitting ? t("form.submitting") : t("form.submit")}
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
