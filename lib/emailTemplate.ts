import { SITE_URL } from './site';

type EmailCta = { label: string; url: string };

type EmailTemplateOptions = {
  preheader?: string;
  heading: string;
  /** Inner paragraphs as raw HTML — keep it to <p> tags, already inline-styled by the caller. */
  bodyHtml: string;
  cta?: EmailCta[];
};

/**
 * Nur's email chrome — dark emerald + gold, mirroring the site's own
 * palette (constants/theme.ts darkColors). Built with tables and inline
 * styles only, since email clients don't reliably support flexbox, custom
 * fonts, or CSS variables.
 */
export function renderEmail({ preheader, heading, bodyHtml, cta = [] }: EmailTemplateOptions): string {
  const font = "Arial, Helvetica, sans-serif";

  const ctaHtml = cta
    .map(
      (c) => `
        <tr>
          <td align="center" style="padding:6px 0;">
            <a href="${c.url}" style="display:inline-block;background-color:#DCB878;color:#17120A;font-family:${font};font-weight:700;font-size:14px;text-decoration:none;padding:14px 30px;border-radius:14px;">${c.label}</a>
          </td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#04140F;">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#04140F;">
      <tr>
        <td align="center" style="padding:44px 20px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
            <tr>
              <td align="center" style="padding-bottom:28px;">
                <img src="${SITE_URL}/nur.png" alt="Nur" width="108" style="display:block;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="background-color:#0A1B15;border:1px solid #163027;border-radius:26px;padding:36px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-family:${font};color:#ECF7F0;font-size:21px;font-weight:700;letter-spacing:-0.2px;padding-bottom:16px;">
                      ${heading}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family:${font};color:#A9C8B8;font-size:15px;line-height:1.7;">
                      ${bodyHtml}
                    </td>
                  </tr>
                  ${ctaHtml ? `<tr><td style="height:10px;line-height:10px;font-size:0;">&nbsp;</td></tr>${ctaHtml}` : ''}
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:28px;font-family:${font};color:#5F8A78;font-size:11px;">
                Nur — made for moments of remembrance.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
