"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { useLocale, useTranslations } from "next-intl";
import clsx from "clsx";
import { leadSchema, type LeadInput, PROPERTY_TYPES } from "@/lib/lead-schema";
import { Link } from "@/i18n/navigation";
import { CalculatorSelect } from "./CalculatorSelect";
import styles from "./Calculator.module.scss";

export function CalculatorLeadGate({
  city,
  bill,
  message,
  onBack,
  onSuccess,
}: {
  city: string;
  bill: string;
  message: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Contact");
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [token, setToken] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city,
      propertyType: undefined,
      topic: "ges",
      bill,
      message,
      product: locale === "tr" ? "Güneş enerjisi hesaplayıcısı" : "Solar energy calculator",
      company: "",
    },
  });

  async function submit(values: LeadInput) {
    setStatus("idle");
    if (siteKey && !token) {
      setStatus("error");
      return;
    }
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, token }),
      });
      if (!response.ok) throw new Error("lead_failed");
      onSuccess();
    } catch {
      setStatus("error");
    }
  }

  const errorFor = (field: "name" | "phone" | "email" | "propertyType") => (
    <span className={clsx(styles.leadFieldError, !errors[field] && styles.leadFieldErrorEmpty)}>
      {errors[field] ? t(`errors.${field}`) : "\u00a0"}
    </span>
  );

  return (
    <form className={styles.leadGate} onSubmit={handleSubmit(submit)} noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.leadHoneypot} {...register("company")} />
      <div className={styles.leadGrid}>
        <label className={styles.leadField}>
          <span>{t("form.name")}</span>
          <input {...register("name")} className={clsx(errors.name && styles.leadInvalid)} placeholder={t("form.namePh")} autoComplete="name" />
          {errorFor("name")}
        </label>
        <label className={styles.leadField}>
          <span>{t("form.phone")}</span>
          <input {...register("phone")} className={clsx(errors.phone && styles.leadInvalid)} placeholder="05xx xxx xx xx" inputMode="tel" autoComplete="tel" />
          {errorFor("phone")}
        </label>
        <label className={styles.leadField}>
          <span>{t("form.email")}</span>
          <input {...register("email")} type="email" className={clsx(errors.email && styles.leadInvalid)} placeholder="ornek@eposta.com" autoComplete="email" />
          {errorFor("email")}
        </label>
        <div className={styles.leadField}>
          <span>{t("form.propertyType")}</span>
          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => (
              <CalculatorSelect
                value={field.value ?? ""}
                onChange={field.onChange}
                label={t("form.propertyType")}
                placeholder={t("form.propertyPh")}
                invalid={Boolean(errors.propertyType)}
                options={PROPERTY_TYPES.map((property) => ({ value: property, label: t(`form.property.${property}`) }))}
              />
            )}
          />
          {errorFor("propertyType")}
        </div>
      </div>

      <label className={styles.leadConsent}>
        <input type="checkbox" {...register("consent")} />
        <span>{t.rich("form.consent", { link: (chunks) => <Link href="/privacy" target="_blank" rel="noopener noreferrer">{chunks}</Link> })}</span>
      </label>
      <span className={clsx(styles.leadFieldError, !errors.consent && styles.leadFieldErrorEmpty)}>
        {errors.consent ? t("errors.consent") : "\u00a0"}
      </span>

      {siteKey && <div className={styles.leadTurnstile}><Turnstile siteKey={siteKey} onSuccess={setToken} onError={() => setToken("")} onExpire={() => setToken("")} options={{ theme: "auto" }} /></div>}
      {status === "error" && <p className={styles.leadSubmitError}>{t("error.desc")}</p>}

      <div className={styles.stepActions}>
        <button type="button" className={styles.backButton} onClick={onBack}>{locale === "tr" ? "Geri" : "Back"}</button>
        <button type="submit" className={styles.nextButton} disabled={isSubmitting}>
          {isSubmitting ? t("form.submitting") : (locale === "tr" ? "Hesabımı göster" : "Show my estimate")}
        </button>
      </div>
    </form>
  );
}
