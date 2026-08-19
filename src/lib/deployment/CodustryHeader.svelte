<script lang="ts">
	/**
	 * Codustry site header — deployment-owned (#174 Step 2 chrome seam).
	 *
	 * Moved verbatim from the forked `(www)/+layout.svelte` so the layout
	 * can be upstream's file again. Registered via `setChrome({ header })`
	 * in `$lib/deployment/chrome.ts`.
	 *
	 * This component also carries the site-wide motion layer that used to
	 * live in the forked layout: Lenis smooth scrolling driven by GSAP's
	 * ticker, and the custom mint cursor. The header mounts exactly once
	 * per page on every public route, and the cursor elements are
	 * position: fixed, so hosting them here is behaviourally identical to
	 * hosting them in the layout.
	 */
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { localePath, toLocale } from '$lib/i18n';
	import { page } from '$app/state';
	import Logo from '$lib/marketing/Logo.svelte';
	import type { SiteHeaderProps } from '$lib/components/www/chrome';

	let { locale: rawLocale, primaryNav, alternateHref }: SiteHeaderProps = $props();

	const locale = $derived.by(() => toLocale(rawLocale));

	// Work, About and Careers are real pages; the rest are homepage sections.
	const sections = $derived.by(() => [
		{ label: m.nav_work(), href: localePath(locale, '/work') },
		{ label: m.nav_about(), href: localePath(locale, '/about') },
		{ label: m.nav_services(), href: localePath(locale, '/') + '#services' },
		{ label: m.nav_clients(), href: localePath(locale, '/') + '#clients' },
		{ label: m.nav_careers(), href: localePath(locale, '/careers') },
	]);
	const homeHref = $derived.by(() => localePath(locale, '/'));

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

<!-- Custom cursor ornament (desktop, motion-allowed only; native cursor stays) -->
<div bind:this={cursorDot} class="cursor-dot" aria-hidden="true"></div>
<div bind:this={cursorRing} class="cursor-ring" aria-hidden="true"></div>

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
			{#each primaryNav as item (item.id)}
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
