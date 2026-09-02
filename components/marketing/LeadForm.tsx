"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import { leadSchema, type LeadInput, PROPERTY_TYPES, LEAD_TOPICS } from "@/lib/lead-schema";
import { whatsappLink } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { IconCheck } from "@/components/ui/icons";
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
}: {
  defaultCity?: string;
  defaultBill?: string;
  /** Catalog group name/slug carried over from a product card CTA. */
  defaultProduct?: string;
  /** Routing topic carried over from a section CTA (?konu=...). */
  defaultTopic?: string;
}) {
  const t = useTranslations("Contact");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [token, setToken] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const {
    register,
    handleSubmit,
    reset,
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
      company: "",
    },
  });

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
        body: JSON.stringify({ ...values, token }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      reset();
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

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.hp}
        {...register("company")}
      />
      <input type="hidden" {...register("product")} />

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

      {/* The tick claims the visitor has read the notice, so the notice has to
          be one click away. It opens in a new tab rather than navigating: a
          half-filled form should survive someone checking what they are
          agreeing to. */}
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

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? t("form.submitting") : t("form.submit")}
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
    </form>
  );
}
