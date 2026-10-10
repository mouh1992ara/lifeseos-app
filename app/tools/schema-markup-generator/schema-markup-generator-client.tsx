"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  ClipboardCopy,
  Copy,
  FileCode2,
  FileText,
  Globe2,
  HelpCircle,
  ListTree,
  Package,
  PersonStanding,
  RotateCcw,
  Search,
  Share2,
  Sparkles,
  Store,
} from "lucide-react";

type SchemaType =
  | "Article"
  | "FAQ"
  | "Product"
  | "LocalBusiness"
  | "BreadcrumbList"
  | "Organization"
  | "WebSite"
  | "Person";

type FormState = Record<string, string>;

const SCHEMA_TYPES: Array<{
  value: SchemaType;
  label: string;
  description: string;
  icon: typeof FileText;
}> = [
  {
    value: "Article",
    label: "Article",
    description: "For blog posts, news articles and editorial content.",
    icon: FileText,
  },
  {
    value: "FAQ",
    label: "FAQ",
    description: "For pages containing frequently asked questions.",
    icon: HelpCircle,
  },
  {
    value: "Product",
    label: "Product",
    description: "For product pages with pricing and availability.",
    icon: Package,
  },
  {
    value: "LocalBusiness",
    label: "Local Business",
    description: "For local companies, stores and service businesses.",
    icon: Store,
  },
  {
    value: "BreadcrumbList",
    label: "Breadcrumb",
    description: "For breadcrumb navigation paths.",
    icon: ListTree,
  },
  {
    value: "Organization",
    label: "Organization",
    description: "For companies, brands and organizations.",
    icon: Building2,
  },
  {
    value: "WebSite",
    label: "Website",
    description: "For website-level structured data.",
    icon: Globe2,
  },
  {
    value: "Person",
    label: "Person",
    description: "For author, profile and personal pages.",
    icon: PersonStanding,
  },
];

const INITIAL_STATE: FormState = {
  headline: "",
  description: "",
  url: "",
  image: "",
  author: "",
  datePublished: "",
  dateModified: "",
  publisher: "",
  question1: "",
  answer1: "",
  question2: "",
  answer2: "",
  question3: "",
  answer3: "",
  productName: "",
  brand: "",
  sku: "",
  price: "",
  currency: "USD",
  availability: "https://schema.org/InStock",
  businessName: "",
  businessType: "LocalBusiness",
  telephone: "",
  streetAddress: "",
  addressLocality: "",
  addressRegion: "",
  postalCode: "",
  addressCountry: "",
  breadcrumb1Name: "Home",
  breadcrumb1Url: "",
  breadcrumb2Name: "",
  breadcrumb2Url: "",
  breadcrumb3Name: "",
  breadcrumb3Url: "",
  organizationName: "",
  organizationUrl: "",
  logo: "",
  websiteName: "",
  websiteUrl: "",
  searchUrl: "",
  personName: "",
  jobTitle: "",
  sameAs: "",
};

function clean(value: string) {
  return value.trim();
}

function buildSchema(type: SchemaType, form: FormState) {
  if (type === "Article") {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: clean(form.headline),
      description: clean(form.description) || undefined,
      url: clean(form.url) || undefined,
      image: clean(form.image) || undefined,
      author: clean(form.author)
        ? {
            "@type": "Person",
            name: clean(form.author),
          }
        : undefined,
      datePublished: clean(form.datePublished) || undefined,
      dateModified: clean(form.dateModified) || undefined,
      publisher: clean(form.publisher)
        ? {
            "@type": "Organization",
            name: clean(form.publisher),
          }
        : undefined,
    };
  }

  if (type === "FAQ") {
    const qaPairs = [
      [form.question1, form.answer1],
      [form.question2, form.answer2],
      [form.question3, form.answer3],
    ].filter(([q, a]) => clean(q) && clean(a));

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: qaPairs.map(([question, answer]) => ({
        "@type": "Question",
        name: clean(question),
        acceptedAnswer: {
          "@type": "Answer",
          text: clean(answer),
        },
      })),
    };
  }

  if (type === "Product") {
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: clean(form.productName),
      description: clean(form.description) || undefined,
      image: clean(form.image) || undefined,
      brand: clean(form.brand)
        ? {
            "@type": "Brand",
            name: clean(form.brand),
          }
        : undefined,
      sku: clean(form.sku) || undefined,
      offers:
        clean(form.price) && clean(form.currency)
          ? {
              "@type": "Offer",
              price: clean(form.price),
              priceCurrency: clean(form.currency),
              availability: clean(form.availability) || undefined,
              url: clean(form.url) || undefined,
            }
          : undefined,
    };
  }

  if (type === "LocalBusiness") {
    return {
      "@context": "https://schema.org",
      "@type": clean(form.businessType) || "LocalBusiness",
      name: clean(form.businessName),
      url: clean(form.url) || undefined,
      image: clean(form.image) || undefined,
      telephone: clean(form.telephone) || undefined,
      address:
        clean(form.streetAddress) ||
        clean(form.addressLocality) ||
        clean(form.addressRegion) ||
        clean(form.postalCode) ||
        clean(form.addressCountry)
          ? {
              "@type": "PostalAddress",
              streetAddress: clean(form.streetAddress) || undefined,
              addressLocality: clean(form.addressLocality) || undefined,
              addressRegion: clean(form.addressRegion) || undefined,
              postalCode: clean(form.postalCode) || undefined,
              addressCountry: clean(form.addressCountry) || undefined,
            }
          : undefined,
    };
  }

  if (type === "BreadcrumbList") {
    const crumbs = [
      [form.breadcrumb1Name, form.breadcrumb1Url],
      [form.breadcrumb2Name, form.breadcrumb2Url],
      [form.breadcrumb3Name, form.breadcrumb3Url],
    ].filter(([name, url]) => clean(name) && clean(url));

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map(([name, url], index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: clean(name),
        item: clean(url),
      })),
    };
  }

  if (type === "Organization") {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: clean(form.organizationName),
      url: clean(form.organizationUrl) || undefined,
      logo: clean(form.logo) || undefined,
      sameAs: clean(form.sameAs)
        ? clean(form.sameAs)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined,
    };
  }

  if (type === "WebSite") {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: clean(form.websiteName),
      url: clean(form.websiteUrl),
      potentialAction: clean(form.searchUrl)
        ? {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: clean(form.searchUrl),
            },
            "query-input": "required name=search_term_string",
          }
        : undefined,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: clean(form.personName),
    url: clean(form.url) || undefined,
    image: clean(form.image) || undefined,
    jobTitle: clean(form.jobTitle) || undefined,
    sameAs: clean(form.sameAs)
      ? clean(form.sameAs)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : undefined,
  };
}

function removeUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(removeUndefined);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined && item !== "")
        .map(([key, item]) => [key, removeUndefined(item)])
    );
  }

  return value;
}

function getRequiredErrors(type: SchemaType, form: FormState) {
  const errors: string[] = [];

  if (type === "Article" && !clean(form.headline)) {
    errors.push("Article headline is required.");
  }

  if (type === "FAQ" && !(clean(form.question1) && clean(form.answer1))) {
    errors.push("Add at least one complete FAQ question and answer.");
  }

  if (type === "Product" && !clean(form.productName)) {
    errors.push("Product name is required.");
  }

  if (type === "LocalBusiness" && !clean(form.businessName)) {
    errors.push("Business name is required.");
  }

  if (
    type === "BreadcrumbList" &&
    !(clean(form.breadcrumb1Name) && clean(form.breadcrumb1Url))
  ) {
    errors.push("Add at least one breadcrumb name and URL.");
  }

  if (type === "Organization" && !clean(form.organizationName)) {
    errors.push("Organization name is required.");
  }

  if (type === "WebSite") {
    if (!clean(form.websiteName)) errors.push("Website name is required.");
    if (!clean(form.websiteUrl)) errors.push("Website URL is required.");
  }

  if (type === "Person" && !clean(form.personName)) {
    errors.push("Person name is required.");
  }

  return errors;
}

export default function SchemaMarkupGeneratorClient() {
  const [schemaType, setSchemaType] = useState<SchemaType>("Article");
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const requiredErrors = useMemo(
    () => getRequiredErrors(schemaType, form),
    [schemaType, form]
  );

  const generatedObject = useMemo(
    () => removeUndefined(buildSchema(schemaType, form)),
    [schemaType, form]
  );

  const generatedJson = useMemo(
    () => JSON.stringify(generatedObject, null, 2),
    [generatedObject]
  );

  function updateField(key: string, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleReset() {
    setForm(INITIAL_STATE);
    setCopied(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generatedJson);
      setCopied(true);

      void fetch("/api/tool-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tool_name: "Schema Markup Generator",
        }),
      }).catch(() => {
        // Tracking should never interrupt the tool.
      });

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  }

  async function handleShare() {
    const shareData = {
      title: "Free Schema Markup Generator | LifeSeos",
      text: "Generate JSON-LD structured data with LifeSeos.",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);

      window.setTimeout(() => {
        setShareCopied(false);
      }, 1800);
    } catch {
      // Ignore cancelled share actions.
    }
  }

  const currentSchema = SCHEMA_TYPES.find(
    (item) => item.value === schemaType
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}

      <section className="relative overflow-hidden px-6 pb-16 pt-20 sm:px-10 lg:px-16 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-600/15 blur-[150px]" />
          <div className="absolute right-0 top-20 h-[320px] w-[320px] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm font-medium text-cyan-300">
            <FileCode2 className="h-4 w-4" />
            Technical SEO Tool
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Generate structured data
            <span className="block bg-gradient-to-r from-cyan-400 via-blue-300 to-white bg-clip-text text-transparent">
              without writing JSON-LD by hand.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Create clean JSON-LD markup for common schema types and copy the
            generated code directly into your website.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-cyan-400" />
              Free to use
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-cyan-400" />
              Multiple schema types
            </span>

            <span className="flex items-center gap-2">
              <Check className="h-4 w-4 text-cyan-400" />
              JSON-LD output
            </span>
          </div>
        </div>
      </section>

      {/* GENERATOR */}

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold">
                    Schema Markup Generator
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Select a schema type and complete the relevant fields.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <label className="mb-3 block text-sm font-medium text-slate-200">
                  Schema Type
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SCHEMA_TYPES.map((item) => {
                    const Icon = item.icon;
                    const active = schemaType === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSchemaType(item.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-cyan-400/40 bg-cyan-400/[0.07]"
                            : "border-white/10 bg-slate-950/40 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              active
                                ? "bg-cyan-400/10"
                                : "bg-white/[0.04]"
                            }`}
                          >
                            <Icon
                              className={`h-4 w-4 ${
                                active
                                  ? "text-cyan-300"
                                  : "text-slate-400"
                              }`}
                            />
                          </div>

                          <div>
                            <p className="font-semibold">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 space-y-5">
                {schemaType === "Article" ? (
                  <>
                    <Field
                      label="Headline"
                      value={form.headline}
                      onChange={(value) => updateField("headline", value)}
                      placeholder="e.g. Complete Technical SEO Guide"
                      required
                    />
                    <Field
                      label="Description"
                      value={form.description}
                      onChange={(value) => updateField("description", value)}
                      placeholder="Short article description"
                    />
                    <Field
                      label="Article URL"
                      value={form.url}
                      onChange={(value) => updateField("url", value)}
                      placeholder="https://example.com/article"
                    />
                    <Field
                      label="Image URL"
                      value={form.image}
                      onChange={(value) => updateField("image", value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Author"
                        value={form.author}
                        onChange={(value) => updateField("author", value)}
                        placeholder="Author name"
                      />
                      <Field
                        label="Publisher"
                        value={form.publisher}
                        onChange={(value) => updateField("publisher", value)}
                        placeholder="Publisher name"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Date Published"
                        value={form.datePublished}
                        onChange={(value) =>
                          updateField("datePublished", value)
                        }
                        placeholder="2026-10-09"
                      />
                      <Field
                        label="Date Modified"
                        value={form.dateModified}
                        onChange={(value) =>
                          updateField("dateModified", value)
                        }
                        placeholder="2026-10-09"
                      />
                    </div>
                  </>
                ) : null}

                {schemaType === "FAQ" ? (
                  <>
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-slate-950/40 p-5"
                      >
                        <p className="text-sm font-semibold">
                          FAQ {index}
                          {index === 1 ? (
                            <span className="ml-2 text-xs font-normal text-cyan-300">
                              Required
                            </span>
                          ) : null}
                        </p>

                        <div className="mt-4 space-y-4">
                          <Field
                            label="Question"
                            value={form[`question${index}`]}
                            onChange={(value) =>
                              updateField(`question${index}`, value)
                            }
                            placeholder="Enter a question"
                          />
                          <TextAreaField
                            label="Answer"
                            value={form[`answer${index}`]}
                            onChange={(value) =>
                              updateField(`answer${index}`, value)
                            }
                            placeholder="Enter the answer"
                          />
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}

                {schemaType === "Product" ? (
                  <>
                    <Field
                      label="Product Name"
                      value={form.productName}
                      onChange={(value) => updateField("productName", value)}
                      placeholder="e.g. SEO Audit Template"
                      required
                    />
                    <Field
                      label="Description"
                      value={form.description}
                      onChange={(value) => updateField("description", value)}
                      placeholder="Product description"
                    />
                    <Field
                      label="Product URL"
                      value={form.url}
                      onChange={(value) => updateField("url", value)}
                      placeholder="https://example.com/product"
                    />
                    <Field
                      label="Image URL"
                      value={form.image}
                      onChange={(value) => updateField("image", value)}
                      placeholder="https://example.com/product.jpg"
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Brand"
                        value={form.brand}
                        onChange={(value) => updateField("brand", value)}
                        placeholder="Brand name"
                      />
                      <Field
                        label="SKU"
                        value={form.sku}
                        onChange={(value) => updateField("sku", value)}
                        placeholder="SKU-123"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-3">
                      <Field
                        label="Price"
                        value={form.price}
                        onChange={(value) => updateField("price", value)}
                        placeholder="49.00"
                      />
                      <Field
                        label="Currency"
                        value={form.currency}
                        onChange={(value) => updateField("currency", value)}
                        placeholder="USD"
                      />
                      <Field
                        label="Availability"
                        value={form.availability}
                        onChange={(value) =>
                          updateField("availability", value)
                        }
                        placeholder="https://schema.org/InStock"
                      />
                    </div>
                  </>
                ) : null}

                {schemaType === "LocalBusiness" ? (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Business Name"
                        value={form.businessName}
                        onChange={(value) =>
                          updateField("businessName", value)
                        }
                        placeholder="Business name"
                        required
                      />
                      <Field
                        label="Business Type"
                        value={form.businessType}
                        onChange={(value) =>
                          updateField("businessType", value)
                        }
                        placeholder="LocalBusiness"
                      />
                    </div>
                    <Field
                      label="Website URL"
                      value={form.url}
                      onChange={(value) => updateField("url", value)}
                      placeholder="https://example.com"
                    />
                    <Field
                      label="Image URL"
                      value={form.image}
                      onChange={(value) => updateField("image", value)}
                      placeholder="https://example.com/store.jpg"
                    />
                    <Field
                      label="Telephone"
                      value={form.telephone}
                      onChange={(value) => updateField("telephone", value)}
                      placeholder="+1 555 123 4567"
                    />
                    <Field
                      label="Street Address"
                      value={form.streetAddress}
                      onChange={(value) =>
                        updateField("streetAddress", value)
                      }
                      placeholder="123 Main Street"
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="City"
                        value={form.addressLocality}
                        onChange={(value) =>
                          updateField("addressLocality", value)
                        }
                        placeholder="Melbourne"
                      />
                      <Field
                        label="Region / State"
                        value={form.addressRegion}
                        onChange={(value) =>
                          updateField("addressRegion", value)
                        }
                        placeholder="VIC"
                      />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Postal Code"
                        value={form.postalCode}
                        onChange={(value) =>
                          updateField("postalCode", value)
                        }
                        placeholder="3000"
                      />
                      <Field
                        label="Country"
                        value={form.addressCountry}
                        onChange={(value) =>
                          updateField("addressCountry", value)
                        }
                        placeholder="AU"
                      />
                    </div>
                  </>
                ) : null}

                {schemaType === "BreadcrumbList" ? (
                  <>
                    {[1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className="grid gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-5 sm:grid-cols-2"
                      >
                        <Field
                          label={`Breadcrumb ${index} Name`}
                          value={form[`breadcrumb${index}Name`]}
                          onChange={(value) =>
                            updateField(`breadcrumb${index}Name`, value)
                          }
                          placeholder={index === 1 ? "Home" : "Page name"}
                        />
                        <Field
                          label={`Breadcrumb ${index} URL`}
                          value={form[`breadcrumb${index}Url`]}
                          onChange={(value) =>
                            updateField(`breadcrumb${index}Url`, value)
                          }
                          placeholder="https://example.com/page"
                        />
                      </div>
                    ))}
                  </>
                ) : null}

                {schemaType === "Organization" ? (
                  <>
                    <Field
                      label="Organization Name"
                      value={form.organizationName}
                      onChange={(value) =>
                        updateField("organizationName", value)
                      }
                      placeholder="Organization name"
                      required
                    />
                    <Field
                      label="Website URL"
                      value={form.organizationUrl}
                      onChange={(value) =>
                        updateField("organizationUrl", value)
                      }
                      placeholder="https://example.com"
                    />
                    <Field
                      label="Logo URL"
                      value={form.logo}
                      onChange={(value) => updateField("logo", value)}
                      placeholder="https://example.com/logo.png"
                    />
                    <Field
                      label="Social Profiles"
                      value={form.sameAs}
                      onChange={(value) => updateField("sameAs", value)}
                      placeholder="https://linkedin.com/..., https://x.com/..."
                      help="Separate multiple profile URLs with commas."
                    />
                  </>
                ) : null}

                {schemaType === "WebSite" ? (
                  <>
                    <Field
                      label="Website Name"
                      value={form.websiteName}
                      onChange={(value) =>
                        updateField("websiteName", value)
                      }
                      placeholder="LifeSeos"
                      required
                    />
                    <Field
                      label="Website URL"
                      value={form.websiteUrl}
                      onChange={(value) =>
                        updateField("websiteUrl", value)
                      }
                      placeholder="https://www.example.com"
                      required
                    />
                    <Field
                      label="Search URL Template"
                      value={form.searchUrl}
                      onChange={(value) => updateField("searchUrl", value)}
                      placeholder="https://example.com/search?q={search_term_string}"
                      help="Optional SearchAction URL template."
                    />
                  </>
                ) : null}

                {schemaType === "Person" ? (
                  <>
                    <Field
                      label="Person Name"
                      value={form.personName}
                      onChange={(value) => updateField("personName", value)}
                      placeholder="Full name"
                      required
                    />
                    <Field
                      label="Profile URL"
                      value={form.url}
                      onChange={(value) => updateField("url", value)}
                      placeholder="https://example.com/author/name"
                    />
                    <Field
                      label="Image URL"
                      value={form.image}
                      onChange={(value) => updateField("image", value)}
                      placeholder="https://example.com/profile.jpg"
                    />
                    <Field
                      label="Job Title"
                      value={form.jobTitle}
                      onChange={(value) => updateField("jobTitle", value)}
                      placeholder="SEO Specialist"
                    />
                    <Field
                      label="Social Profiles"
                      value={form.sameAs}
                      onChange={(value) => updateField("sameAs", value)}
                      placeholder="https://linkedin.com/..., https://x.com/..."
                      help="Separate multiple profile URLs with commas."
                    />
                  </>
                ) : null}
              </div>

              {requiredErrors.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

                    <div>
                      <p className="text-sm font-semibold text-amber-200">
                        Complete the required fields
                      </p>

                      <ul className="mt-2 space-y-1 text-sm text-amber-100/70">
                        {requiredErrors.map((error) => (
                          <li key={error}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-300">
                  <Check className="h-4 w-4" />
                  Required fields are complete.
                </div>
              )}
            </div>

            {/* OUTPUT */}

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    JSON-LD Output
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    {currentSchema?.label} schema preview
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    The code updates automatically as you complete the fields.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                  <FileCode2 className="h-5 w-5 text-cyan-400" />
                </div>
              </div>

              <div className="relative mt-7">
                <pre className="min-h-[560px] overflow-auto rounded-2xl border border-white/10 bg-black/40 p-5 text-xs leading-6 text-cyan-100">
                  <code>{generatedJson}</code>
                </pre>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/30"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy JSON-LD
                    </>
                  )}
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  <ClipboardCopy className="h-4 w-4" />
                  Copy Schema
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTALL */}

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-white/[0.025] p-7 sm:p-9">
          <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
                Implementation
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                How to add JSON-LD to your page
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                Copy the generated JSON-LD and place it inside a script element
                with type <code className="text-cyan-300">application/ld+json</code>.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                Make sure the structured data accurately reflects content that
                is actually visible or relevant on the page.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <pre className="overflow-auto text-xs leading-6 text-slate-300">
                <code>{`<script type="application/ld+json">
${generatedJson}
</script>`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* SHARE */}

      <section className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                <Share2 className="h-5 w-5 text-cyan-400" />
              </div>

              <div>
                <h2 className="font-semibold">Share this tool</h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Share the Schema Markup Generator with developers, marketers
                  and website owners.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
            >
              {shareCopied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  Link copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share tool
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* WHY */}

      <section className="border-t border-white/5 px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Structured Data
            </p>

            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Make page information easier for search engines to understand
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Schema markup provides structured information about page entities
              such as articles, products, organizations and local businesses.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Clearer Context",
                text: "Describe important entities and page relationships in a structured format.",
              },
              {
                icon: FileCode2,
                title: "JSON-LD Output",
                text: "Generate a clean format that can be inserted directly into modern websites.",
              },
              {
                icon: ListTree,
                title: "Multiple Schema Types",
                text: "Create markup for common content, business and navigation use cases.",
              },
              {
                icon: Check,
                title: "Required Field Checks",
                text: "Catch missing core fields before copying the generated markup.",
              },
              {
                icon: Sparkles,
                title: "Faster Setup",
                text: "Avoid manually writing the same structured data boilerplate each time.",
              },
              {
                icon: Globe2,
                title: "Website Ready",
                text: "Use the generated code as a practical starting point for implementation.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-white/[0.04]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* RELATED */}

      <section className="px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">
              Continue Optimizing
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Related technical SEO tools
            </h2>

            <p className="mt-3 max-w-2xl text-slate-400">
              Continue improving your site's technical SEO with LifeSeos.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/tools/seo-analyzer"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                <Search className="h-5 w-5 text-cyan-400" />
              </div>

              <h3 className="mt-5 font-semibold">SEO Analyzer</h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Review technical SEO issues and optimization opportunities.
              </p>
            </Link>

            <Link
              href="/tools/seo-page-analyzer"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                <FileText className="h-5 w-5 text-cyan-400" />
              </div>

              <h3 className="mt-5 font-semibold">SEO Page Analyzer</h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Analyze titles, headings, links and on-page SEO elements.
              </p>
            </Link>

            <Link
              href="/tools/xml-sitemap-generator"
              className="group rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-white/[0.04]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                <Globe2 className="h-5 w-5 text-cyan-400" />
              </div>

              <h3 className="mt-5 font-semibold">XML Sitemap Generator</h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Generate sitemap structures for search engine crawling.
              </p>
            </Link>

            <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/[0.045] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                <FileCode2 className="h-5 w-5 text-cyan-400" />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <h3 className="font-semibold">Schema Markup Generator</h3>

                <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  Current
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Generate JSON-LD markup for common structured data types.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  help?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
        {required ? (
          <span className="ml-2 text-xs font-normal text-cyan-300">
            Required
          </span>
        ) : null}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
      />

      {help ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">{help}</p>
      ) : null}
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
      />
    </div>
  );
}
