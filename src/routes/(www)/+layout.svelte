<script lang="ts">
	import '../../app.css';
	import * as m from '$lib/paraglide/messages';
	import { localePath, toLocale, getAlternateLocale } from '$lib/i18n';
	import { page } from '$app/state';
	import Seo from '$lib/components/seo/Seo.svelte';
	import CookieBanner from '$lib/components/consent/CookieBanner.svelte';
	import Logo from '$lib/marketing/Logo.svelte';
	import type { PageSeo } from '$lib/seo';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	// Each public +page.server.ts may return `seo: PageSeo`; the layout
	// reads it via $app/state and renders all SEO tags via <Seo />.
	const pageSeo = $derived((page.data.seo as PageSeo | undefined) ?? undefined);
	const seoDefaults = $derived({
		siteName: data.siteSettings?.siteName ?? m.site_name(),
		description: m.site_description(),
		image: undefined,
		twitter: undefined,
	});
	const locale = $derived.by(() => toLocale(data.locale));
</script>

<svelte:head>
	<!-- Self-hosted (static/fonts) — the CSP is style-src 'self', so no Google Fonts CDN. -->
	<link rel="stylesheet" href="/fonts/fonts.css" />
	<link
		rel="preload"
		href="/fonts/space-grotesk-400-latin.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
</svelte:head>

<Seo seo={pageSeo} defaults={seoDefaults} locale={toLocale(data.locale)} />

<div class="flex min-h-screen flex-col bg-[#181C38]">
	<header class="sticky top-0 z-50 border-b border-white/10 bg-[#181C38]/90 text-white backdrop-blur">
		<div class="container mx-auto flex items-center justify-between px-6 py-4">
			<a href={localePath(locale, '/')} aria-label="Codustry — home">
				<Logo class="h-6 w-auto" />
			</a>
			<nav class="flex items-center gap-5 text-sm">
				{#each data.nav.primary as item (item.id)}
					<a href={item.href} class="text-white/70 transition-colors hover:text-white">{item.label}</a>
				{/each}
				<a
					href={localePath(locale, '/blog')}
					class="text-white/70 transition-colors hover:text-white"
				>
					{m.nav_blog()}
				</a>
				<a
					href={localePath(getAlternateLocale(locale), '/')}
					data-sveltekit-reload
					class="rounded-full border border-white/25 px-3 py-1 text-xs text-white/80 transition-colors hover:border-white hover:text-white"
				>
					{m.lang_switch()}
				</a>
			</nav>
		</div>
	</header>

	<main class="flex-1 bg-white">
		{@render children()}
	</main>

	<footer class="bg-[#181C38] py-12 text-sm text-white/60">
		<div
			class="container mx-auto flex flex-col items-center justify-between gap-6 px-6 sm:flex-row"
		>
			<div class="flex flex-col items-center gap-3 sm:items-start">
				<Logo class="h-5 w-auto text-white" />
				<p>{m.footer_copyright({ year: new Date().getFullYear().toString() })}</p>
			</div>
			<div class="flex flex-col items-center gap-3 sm:items-end">
				{#if data.nav.footer.length > 0}
					<nav class="flex flex-wrap gap-4">
						{#each data.nav.footer as item (item.id)}
							<a href={item.href} class="transition-colors hover:text-white">{item.label}</a>
						{/each}
					</nav>
				{/if}
				<nav class="flex gap-4" aria-label="Social links">
					<a
						href="https://github.com/codustry"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-colors hover:text-white">GitHub</a
					>
					<a
						href="https://www.facebook.com/codustry"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-colors hover:text-white">Facebook</a
					>
					<a
						href="https://www.linkedin.com/company/codustry"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-colors hover:text-white">LinkedIn</a
					>
				</nav>
			</div>
		</div>
	</footer>
</div>

<CookieBanner
	consent={data.consent}
	privacyHref={data.hasPrivacyPage ? localePath(locale, '/privacy-policy') : undefined}
/>

<!--
	Cloudflare Web Analytics beacon (v1.8). Only loaded when:
	- the operator set a token in /admin/settings, AND
	- the visitor opted in to analytics via the cookie banner.
	The first-party D1 page-view counter runs regardless.
-->
{#if data.siteSettings?.cfaToken && data.consent?.analytics}
	<script
		defer
		src="https://static.cloudflareinsights.com/beacon.min.js"
		data-cf-beacon={`{"token": "${data.siteSettings.cfaToken}"}`}
	></script>
{/if}
