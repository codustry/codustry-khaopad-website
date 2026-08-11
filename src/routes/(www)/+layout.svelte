<script lang="ts">
	import '../../app.css';
	import * as m from '$lib/paraglide/messages';
	import { localePath, toLocale, getAlternateLocale } from '$lib/i18n';
	import { page } from '$app/state';
	import Seo from '$lib/components/seo/Seo.svelte';
	import CookieBanner from '$lib/components/consent/CookieBanner.svelte';
	import Logo from '$lib/marketing/Logo.svelte';
	import { homeContent } from '$lib/marketing/content';
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
	const home = $derived.by(() => homeContent(locale));

	// Section links live on the homepage; from other routes they navigate home first.
	const sections = $derived.by(() => [
		{ label: m.nav_work(), hash: '#works' },
		{ label: m.nav_services(), hash: '#services' },
		{ label: m.nav_clients(), hash: '#clients' },
	]);
	const homeHref = $derived.by(() => localePath(locale, '/'));

	let menuOpen = $state(false);
	$effect(() => {
		// Close the overlay whenever navigation happens (hash or route).
		void page.url;
		menuOpen = false;
	});

	const socials = [
		{ label: 'GitHub', href: 'https://github.com/codustry' },
		{ label: 'Facebook', href: 'https://www.facebook.com/codustry' },
		{ label: 'LinkedIn', href: 'https://www.linkedin.com/company/codustry' },
	];
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

<div class="flex min-h-screen flex-col bg-white text-[#181C38]">
	<header class="sticky top-0 z-50 border-b border-[#181C38]/8 bg-white/85 backdrop-blur">
		<div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
			<a href={homeHref} aria-label="Codustry — home" class="shrink-0 text-[#181C38]">
				<Logo class="h-5 w-auto" />
			</a>

			<!-- Desktop nav -->
			<nav class="hidden items-center gap-7 text-sm md:flex" aria-label="Primary">
				{#each sections as s (s.hash)}
					<a href={homeHref + s.hash} class="nav-link text-[#181C38]/65 hover:text-[#181C38]"
						>{s.label}</a
					>
				{/each}
				<a
					href={localePath(locale, '/blog')}
					class="nav-link text-[#181C38]/65 hover:text-[#181C38]"
				>
					{m.nav_blog()}
				</a>
				{#each data.nav.primary as item (item.id)}
					<a href={item.href} class="nav-link text-[#181C38]/65 hover:text-[#181C38]">{item.label}</a>
				{/each}
			</nav>

			<div class="hidden items-center gap-4 md:flex">
				<a
					href={localePath(getAlternateLocale(locale), '/')}
					data-sveltekit-reload
					class="text-xs tracking-[0.2em] text-[#181C38]/55 uppercase transition-colors hover:text-[#181C38]"
				>
					{m.lang_switch()}
				</a>
				<!-- Contact isolated as the CTA, Ogilvy-style -->
				<a
					href={homeHref + '#contact'}
					class="rounded-full bg-[#181C38] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#181C38]/85"
				>
					{m.nav_contact()}
				</a>
			</div>

			<!-- Mobile: language + menu button -->
			<div class="flex items-center gap-4 md:hidden">
				<a
					href={localePath(getAlternateLocale(locale), '/')}
					data-sveltekit-reload
					class="text-xs tracking-[0.2em] text-[#181C38]/55 uppercase"
				>
					{m.lang_switch()}
				</a>
				<button
					type="button"
					class="text-sm font-medium tracking-[0.15em] uppercase"
					aria-expanded={menuOpen}
					aria-controls="mobile-menu"
					onclick={() => (menuOpen = !menuOpen)}
				>
					{menuOpen ? m.nav_close() : m.nav_menu()}
				</button>
			</div>
		</div>
	</header>

	<!-- Mobile full-screen menu -->
	{#if menuOpen}
		<div
			id="mobile-menu"
			class="fixed inset-0 z-40 flex flex-col justify-between bg-[#181C38] px-6 pt-24 pb-10 text-white md:hidden"
		>
			<nav class="flex flex-col gap-2" aria-label="Mobile">
				{#each [...sections, { label: m.nav_blog(), hash: '', href: localePath(locale, '/blog') }, { label: m.nav_contact(), hash: '#contact' }] as item, i (i)}
					<a
						href={'href' in item && item.href ? item.href : homeHref + item.hash}
						class="menu-item display-font border-b border-white/10 py-4 text-3xl font-medium"
						style={`animation-delay:${i * 60}ms`}
						onclick={() => (menuOpen = false)}
					>
						{item.label}
					</a>
				{/each}
			</nav>
			<div class="flex items-center justify-between text-sm text-white/60">
				<div class="flex gap-5">
					{#each socials as s (s.label)}
						<a href={s.href} target="_blank" rel="noopener noreferrer" class="hover:text-white"
							>{s.label}</a
						>
					{/each}
				</div>
				<Logo tilesOnly class="h-6 w-7 text-white" />
			</div>
		</div>
	{/if}

	<main class="flex-1 bg-white">
		{@render children()}
	</main>

	<footer class="border-t border-[#181C38]/10 bg-white">
		<div class="mx-auto max-w-7xl px-6 pt-16 pb-8">
			<div class="grid gap-12 md:grid-cols-12">
				<!-- Brand + big email CTA -->
				<div class="md:col-span-5">
					<Logo class="h-6 w-auto text-[#181C38]" />
					<p class="mt-4 max-w-xs leading-relaxed text-[#181C38]/60">{m.footer_tagline()}</p>
					<a
						href={`mailto:${home.contact.email}`}
						class="display-font mt-6 inline-block text-xl font-medium underline decoration-[#5AEDC5] decoration-2 underline-offset-6 hover:decoration-4 md:text-2xl"
					>
						{home.contact.email}
					</a>
				</div>

				<!-- Explore -->
				<nav class="md:col-span-3" aria-label="Footer — explore">
					<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
						{m.footer_explore()}
					</p>
					<ul class="flex flex-col gap-2.5 text-sm">
						{#each sections as s (s.hash)}
							<li>
								<a href={homeHref + s.hash} class="text-[#181C38]/65 hover:text-[#181C38]"
									>{s.label}</a
								>
							</li>
						{/each}
						<li>
							<a href={localePath(locale, '/blog')} class="text-[#181C38]/65 hover:text-[#181C38]"
								>{m.nav_blog()}</a
							>
						</li>
						{#each data.nav.footer as item (item.id)}
							<li>
								<a href={item.href} class="text-[#181C38]/65 hover:text-[#181C38]">{item.label}</a>
							</li>
						{/each}
					</ul>
				</nav>

				<!-- Connect -->
				<nav class="md:col-span-2" aria-label="Footer — social">
					<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
						{m.footer_connect()}
					</p>
					<ul class="flex flex-col gap-2.5 text-sm">
						{#each socials as s (s.label)}
							<li>
								<a
									href={s.href}
									target="_blank"
									rel="noopener noreferrer"
									class="text-[#181C38]/65 hover:text-[#181C38]">{s.label}</a
								>
							</li>
						{/each}
					</ul>
				</nav>

				<!-- Visit -->
				<div class="md:col-span-2">
					<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
						{m.footer_visit()}
					</p>
					<p class="text-sm leading-relaxed text-[#181C38]/65">{home.contact.address}</p>
				</div>
			</div>

			<div
				class="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[#181C38]/10 pt-6 text-xs text-[#181C38]/45 sm:flex-row"
			>
				<p>{m.footer_copyright({ year: new Date().getFullYear().toString() })}</p>
				<a
					href="https://github.com/codustry/khaopad"
					target="_blank"
					rel="noopener noreferrer"
					class="hover:text-[#181C38]"
				>
					{m.footer_built()} ↗
				</a>
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

<style>
	.display-font {
		font-family:
			'Space Grotesk',
			'IBM Plex Sans Thai',
			system-ui,
			sans-serif;
	}
	.nav-link {
		position: relative;
		transition: color 0.2s;
	}
	.nav-link::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -4px;
		height: 1.5px;
		width: 100%;
		background: #5aedc5;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.nav-link:hover::after {
		transform: scaleX(1);
		transform-origin: left;
	}
	.menu-item {
		animation: menu-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes menu-in {
		from {
			opacity: 0;
			transform: translateY(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.menu-item {
			animation: none;
		}
	}
</style>
