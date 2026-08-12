<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { localePath, toLocale, getAlternateLocale, SUPPORTED_LOCALES } from '$lib/i18n';
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

	// Work, About and Careers are real pages; the rest are homepage sections.
	const sections = $derived.by(() => [
		{ label: m.nav_work(), href: localePath(locale, '/work') },
		{ label: m.nav_about(), href: localePath(locale, '/about') },
		{ label: m.nav_services(), href: localePath(locale, '/') + '#services' },
		{ label: m.nav_clients(), href: localePath(locale, '/') + '#clients' },
		{ label: m.nav_careers(), href: localePath(locale, '/careers') },
	]);
	const homeHref = $derived.by(() => localePath(locale, '/'));

	// Language switch keeps the visitor where they are — swap only the
	// leading locale segment and preserve the query string (upstream
	// v4.1.0). Previously every switch bounced to the homepage.
	const alternateHref = $derived.by(() => {
		const segments = page.url.pathname.split('/').filter(Boolean);
		const alt = getAlternateLocale(locale);
		if (SUPPORTED_LOCALES.includes(segments[0] as (typeof SUPPORTED_LOCALES)[number])) {
			segments[0] = alt;
		} else {
			segments.unshift(alt);
		}
		return `/${segments.join('/')}${page.url.search}`;
	});

	let menuOpen = $state(false);
	$effect(() => {
		// Close the overlay whenever navigation happens (hash or route).
		void page.url;
		menuOpen = false;
	});

	let cursorDot: HTMLDivElement | undefined = $state();
	let cursorRing: HTMLDivElement | undefined = $state();

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const finePointer = window.matchMedia('(pointer: fine)').matches;
		if (reduced || new URLSearchParams(window.location.search).has('noanim')) return;

		let disposed = false;
		const cleanups: Array<() => void> = [];

		(async () => {
			const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger'),
				import('lenis'),
			]);
			if (disposed) return;
			gsap.registerPlugin(ScrollTrigger);

			// ── Lenis smooth scrolling, driven by GSAP's ticker ──
			const lenis = new Lenis({ anchors: true, duration: 1.1 });
			lenis.on('scroll', ScrollTrigger.update);
			const raf = (time: number) => lenis.raf(time * 1000);
			gsap.ticker.add(raf);
			gsap.ticker.lagSmoothing(0);
			cleanups.push(() => {
				gsap.ticker.remove(raf);
				lenis.destroy();
			});

			// ── Custom cursor: mint dot + trailing ring that reacts to targets ──
			if (finePointer && cursorDot && cursorRing) {
				const dot = cursorDot;
				const ring = cursorRing;
				gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
				const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2' });
				const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2' });
				const ringX = gsap.quickTo(ring, 'x', { duration: 0.35, ease: 'power3' });
				const ringY = gsap.quickTo(ring, 'y', { duration: 0.35, ease: 'power3' });
				const move = (e: MouseEvent) => {
					dotX(e.clientX);
					dotY(e.clientY);
					ringX(e.clientX);
					ringY(e.clientY);
				};
				const over = (e: MouseEvent) => {
					const hot = (e.target as Element | null)?.closest?.('a, button, [data-cursor]');
					gsap.to(ring, {
						scale: hot ? 2.2 : 1,
						opacity: hot ? 0.9 : 0.5,
						duration: 0.3,
						ease: 'power2.out',
					});
				};
				window.addEventListener('mousemove', move, { passive: true });
				window.addEventListener('mouseover', over, { passive: true });
				gsap.to([dot, ring], { autoAlpha: 1, duration: 0.4, delay: 0.2 });
				cleanups.push(() => {
					window.removeEventListener('mousemove', move);
					window.removeEventListener('mouseover', over);
				});
			}
		})();

		return () => {
			disposed = true;
			cleanups.forEach((fn) => fn());
		};
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

<!-- Custom cursor ornament (desktop, motion-allowed only; native cursor stays) -->
<div bind:this={cursorDot} class="cursor-dot" aria-hidden="true"></div>
<div bind:this={cursorRing} class="cursor-ring" aria-hidden="true"></div>

<div class="flex min-h-screen flex-col bg-white text-[#181C38]">
	<!-- Ogilvy-style header: menu left · large centered logo · CTA + language right -->
	<header class="sticky top-0 z-50 border-b border-[#181C38]/8 bg-white/85 backdrop-blur">
		<div
			class="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 md:py-5"
		>
			<!-- Left: nav (desktop) / menu button (mobile).
			     Blog is intentionally NOT here — it lives in the footer;
			     /work is the flagship index. -->
			<nav class="hidden items-center gap-7 text-sm md:flex" aria-label="Primary">
				{#each sections as s (s.href)}
					<a href={s.href} class="nav-link text-[#181C38]/65 hover:text-[#181C38]">{s.label}</a>
				{/each}
				{#each data.nav.primary as item (item.id)}
					<a href={item.href} class="nav-link text-[#181C38]/65 hover:text-[#181C38]">{item.label}</a>
				{/each}
			</nav>
			<div class="flex items-center md:hidden">
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

			<!-- Center: the logo, big, mono — colors bloom on hover -->
			<a href={homeHref} aria-label="Codustry — home" class="justify-self-center text-[#181C38]">
				<Logo mono class="h-7 w-auto md:h-9" />
			</a>

			<!-- Right: language switch + Contact CTA -->
			<div class="flex items-center justify-end gap-4">
				<a
					href={alternateHref}
					data-sveltekit-reload
					class="text-xs tracking-[0.2em] text-[#181C38]/55 uppercase transition-colors hover:text-[#181C38]"
				>
					{m.lang_switch()}
				</a>
				<a
					href={homeHref + '#contact'}
					class="hidden rounded-full bg-[#181C38] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#181C38]/85 md:inline-flex"
				>
					{m.nav_contact()}
				</a>
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
				{#each [...sections, { label: m.nav_contact(), href: homeHref + '#contact' }] as item, i (i)}
					<a
						href={item.href}
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
			<div class="grid gap-10 md:grid-cols-12 md:gap-12">
				<!-- Brand + big email CTA -->
				<div class="md:col-span-5">
					<Logo mono class="h-6 w-auto text-[#181C38]" />
					<p class="mt-4 max-w-xs leading-relaxed text-[#181C38]/60">{m.footer_tagline()}</p>
					<a
						href={`mailto:${home.contact.email}`}
						class="display-font mt-6 inline-block text-xl font-medium underline decoration-[#5AEDC5] decoration-2 underline-offset-6 hover:decoration-4 md:text-2xl"
					>
						{home.contact.email}
					</a>
				</div>

				<!-- Explore · Connect · Visit — side by side even on mobile,
				     so the footer stays short instead of stacking three lists. -->
				<div class="grid grid-cols-3 gap-4 md:col-span-7 md:gap-8">
					<nav aria-label="Footer — explore">
						<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
							{m.footer_explore()}
						</p>
						<ul class="flex flex-col gap-2.5 text-xs sm:text-sm">
							{#each sections as s (s.href)}
								<li>
									<a href={s.href} class="text-[#181C38]/65 hover:text-[#181C38]">{s.label}</a>
								</li>
							{/each}
							<li>
								<a href={localePath(locale, '/blog')} class="text-[#181C38]/65 hover:text-[#181C38]"
									>{m.nav_blog()}</a
								>
							</li>
							{#each data.nav.footer as item (item.id)}
								<li>
									<a href={item.href} class="text-[#181C38]/65 hover:text-[#181C38]">{item.label}</a
									>
								</li>
							{/each}
						</ul>
					</nav>

					<nav aria-label="Footer — social">
						<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
							{m.footer_connect()}
						</p>
						<ul class="flex flex-col gap-2.5 text-xs sm:text-sm">
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

					<div>
						<p class="mb-4 text-xs font-medium tracking-[0.25em] text-[#181C38]/45 uppercase">
							{m.footer_visit()}
						</p>
						<a
							href={home.contact.mapsUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="block text-xs leading-relaxed text-[#181C38]/65 underline decoration-[#181C38]/20 underline-offset-4 transition-colors hover:text-[#181C38] sm:text-sm"
						>
							{home.contact.address} ↗
						</a>
						<a
							href={home.contact.phoneHref}
							class="mt-3 block text-xs text-[#181C38]/65 transition-colors hover:text-[#181C38] sm:text-sm"
						>
							{home.contact.phone}
						</a>
					</div>
				</div>
			</div>

			<div
				class="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[#181C38]/10 pt-6 text-xs text-[#181C38]/45 sm:flex-row"
			>
				<p>{m.footer_copyright({ year: new Date().getFullYear().toString() })}</p>
				<!-- The quiet tech flex: our platform + the AI tools that helped. -->
				<p class="text-center sm:text-right">
					<a
						href="https://github.com/codustry/khaopad"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-[#181C38]">{m.footer_built()} ↗</a
					>
					{m.footer_made_with()}
					<a
						href="https://claude.com"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-[#181C38]">Claude</a
					>
					&amp;
					<a
						href="https://higgsfield.ai"
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-[#181C38]">Higgsfield</a
					>
				</p>
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
	.cursor-dot,
	.cursor-ring {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		pointer-events: none;
		border-radius: 9999px;
		visibility: hidden;
		opacity: 0;
	}
	.cursor-dot {
		width: 7px;
		height: 7px;
		background: #5aedc5;
		mix-blend-mode: difference;
	}
	.cursor-ring {
		width: 34px;
		height: 34px;
		border: 1.5px solid rgba(24, 28, 56, 0.45);
		opacity: 0.5;
	}
	@media (pointer: coarse) {
		.cursor-dot,
		.cursor-ring {
			display: none;
		}
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
