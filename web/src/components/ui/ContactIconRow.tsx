"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  isContactSocialIcon,
  normalizeExternalHref,
  socialLinkIconSrc,
  whatsappHrefFromPhone,
} from "@/lib/social-icons";

type ContactLink = {
  id: string;
  label: string;
  url: string;
  icon: string;
  visible?: boolean;
};

type ContactIconRowProps = {
  phone?: string | null;
  email?: string | null;
  links?: ContactLink[];
  mailAriaLabel: string;
  mailClassName?: string;
  mailIconClassName?: string;
  iconSize?: number;
  className?: string;
  onEngage?: () => void;
};

export function ContactIconRow({
  phone,
  email,
  links = [],
  mailAriaLabel,
  mailClassName,
  mailIconClassName = "text-[28px]",
  iconSize = 22,
  className,
  onEngage,
}: ContactIconRowProps) {
  const whatsappHref = whatsappHrefFromPhone(phone);
  const contactLinks = links.filter(
    (l) => (l.visible ?? true) && isContactSocialIcon(l.icon) && l.icon !== "whatsapp",
  );

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp"
          title="WhatsApp"
          onClick={onEngage}
          className="inline-flex items-center justify-center"
        >
          <Image
            src="/whatsapp.png"
            alt=""
            width={iconSize}
            height={iconSize}
            className="object-contain"
            style={{ width: iconSize, height: iconSize }}
          />
        </a>
      ) : null}

      {contactLinks.map((link) => {
        const src = socialLinkIconSrc(link.icon);
        if (!src) return null;
        return (
          <a
            key={link.id}
            href={normalizeExternalHref(link.url)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            title={link.label}
            onClick={onEngage}
            className="inline-flex items-center justify-center"
          >
            <Image
              src={src}
              alt=""
              width={iconSize}
              height={iconSize}
              className="object-contain"
              style={{ width: iconSize, height: iconSize }}
            />
          </a>
        );
      })}

      {email ? (
        <a
          href={`mailto:${email}`}
          aria-label={mailAriaLabel}
          title={email}
          onClick={onEngage}
          className={cn("inline-flex items-center justify-center", mailClassName)}
        >
          <Icon name="mail" className={mailIconClassName} />
        </a>
      ) : null}
    </div>
  );
}
