<script lang="ts">
	import { onMount } from 'svelte';
	import { toLocale } from '$lib/i18n';
	import { homeContent, BRAND } from '$lib/marketing/content';
	import Logo from '$lib/marketing/Logo.svelte';

	let { data } = $props();
	const locale = $derived.by(() => toLocale(data.locale));
	const c = $derived.by(() => homeContent(locale));

	let root: HTMLElement;
	let heroCanvas: HTMLCanvasElement;
	let worksTrack: HTMLElement;
	let worksViewport: HTMLElement;
	let magneticBtn: HTMLAnchorElement;

	// ─── Hero canvas: interactive diamond-tile field ─────────────
	// A grid of rotated squares (the logo's diamond motif). Tiles near the
	// pointer light up in brand colors and swell; the rest breathe slowly.
	function startDiamondField(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return () => {};
		const palette = [BRAND.mint, BRAND.cyan, BRAND.pink, BRAND.indigo, BRAND.amber];
		let raf = 0;
		let running = true;
		let w = 0,
			h = 0,
			dpr = 1;
		const pointer = { x: -9999, y: -9999 };
		let t = 0;

		type Tile = { x: number; y: number; color: string; phase: number };
		let tiles: Tile[] = [];
		const GAP = 56;

		function layout() {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = w * dpr;
			canvas.height = h * dpr;
			ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
			tiles = [];
			const cols = Math.ceil(w / GAP) + 2;
			const rows = Math.ceil(h / GAP) + 2;
			for (let r = 0; r < rows; r++) {
				for (let col = 0; col < cols; col++) {
					// Offset every other row for the lattice look.
					const x = col * GAP + (r % 2 === 0 ? 0 : GAP / 2);
					const y = r * GAP;
					tiles.push({
						x,
						y,
						color: palette[(r * 31 + col * 17) % palette.length],
						phase: ((r * 13 + col * 7) % 20) / 20,
					});
				}
			}
		}

		function frame() {
			if (!running) return;
			t += 0.016;
			ctx!.clearRect(0, 0, w, h);
			for (const tile of tiles) {
				const dx = tile.x - pointer.x;
				const dy = tile.y - pointer.y;
				const dist = Math.hypot(dx, dy);
				const near = Math.max(0, 1 - dist / 220);
				const breathe = 0.5 + 0.5 * Math.sin(t * 1.2 + tile.phase * Math.PI * 2);
				const alpha = 0.05 + breathe * 0.05 + near * 0.85;
				const size = 5 + near * 9;
				ctx!.save();
				ctx!.translate(tile.x, tile.y);
				ctx!.rotate(Math.PI / 4);
				ctx!.globalAlpha = alpha;
				ctx!.fillStyle = near > 0.02 ? tile.color : '#8fa0c9';
				const r = 2 + near * 2;
				ctx!.beginPath();
				ctx!.roundRect(-size / 2, -size / 2, size, size, r);
				ctx!.fill();
				ctx!.restore();
			}
			raf = requestAnimationFrame(frame);
		}

		function onMove(e: PointerEvent) {
			const rect = canvas.getBoundingClientRect();
			pointer.x = e.clientX - rect.left;
			pointer.y = e.clientY - rect.top;
		}
		function onLeave() {
			pointer.x = -9999;
			pointer.y = -9999;
		}

		layout();
		frame();
		const ro = new ResizeObserver(layout);
		ro.observe(canvas);
		// Pause the loop when the hero scrolls out of view.
		const io = new IntersectionObserver(([entry]) => {
			const visible = entry?.isIntersecting ?? false;
			if (visible && !running) {
				running = true;
				frame();
			} else if (!visible) {
				running = false;
				cancelAnimationFrame(raf);
			}
		});
		io.observe(canvas);
		canvas.parentElement?.addEventListener('pointermove', onMove);
		canvas.parentElement?.addEventListener('pointerleave', onLeave);

		return () => {
			running = false;
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			canvas.parentElement?.removeEventListener('pointermove', onMove);
			canvas.parentElement?.removeEventListener('pointerleave', onLeave);
		};
	}

	onMount(() => {
		let disposed = false;
		let cleanupCanvas: (() => void) | undefined;
		let mm: { revert: () => void } | undefined;
		let magnetCleanup: (() => void) | undefined;

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger'),
			]);
			if (disposed) return;
			gsap.registerPlugin(ScrollTrigger);

			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (!reduced) cleanupCanvas = startDiamondField(heroCanvas);

			const matchMedia = gsap.matchMedia();
			mm = matchMedia;

			matchMedia.add(
				{
					reduced: '(prefers-reduced-motion: reduce)',
					desktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
					mobile: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
				},
				(mmCtx) => {
					const { reduced: isReduced, desktop } = mmCtx.conditions as {
						reduced: boolean;
						desktop: boolean;
					};
					if (isReduced) {
						// Everything is authored visible-by-default; nothing to do.
						return;
					}

					// ── Hero entrance ──
					gsap
						.timeline({ defaults: { ease: 'power4.out' } })
						.from('.hero-kicker', { y: 24, autoAlpha: 0, duration: 0.7 }, 0.1)
						.from(
							'.hero-line-inner',
							{ yPercent: 110, duration: 1.1, stagger: 0.12 },
							0.2,
						)
						.from('.hero-sub', { y: 28, autoAlpha: 0, duration: 0.8 }, 0.8)
						.from('.hero-cta', { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08 }, 1.0)
						.from('.hero-scroll-hint', { autoAlpha: 0, duration: 0.6 }, 1.4);

					// ── Marquee ──
					gsap.to('.marquee-track', {
						xPercent: -50,
						ease: 'none',
						duration: 24,
						repeat: -1,
					});

					// ── Section headline reveals ──
					for (const el of gsap.utils.toArray<HTMLElement>('.reveal-up')) {
						gsap.from(el, {
							y: 48,
							autoAlpha: 0,
							duration: 0.9,
							ease: 'power3.out',
							scrollTrigger: { trigger: el, start: 'top 85%' },
						});
					}

					// ── Pillars stagger ──
					gsap.from('.pillar-card', {
						y: 64,
						autoAlpha: 0,
						duration: 0.8,
						ease: 'power3.out',
						stagger: 0.12,
						scrollTrigger: { trigger: '.pillar-grid', start: 'top 80%' },
					});

					// ── Works: pinned horizontal scroll on desktop ──
					if (desktop && worksTrack && worksViewport) {
						const getDistance = () => worksTrack.scrollWidth - worksViewport.clientWidth;
						gsap.to(worksTrack, {
							x: () => -getDistance(),
							ease: 'none',
							scrollTrigger: {
								trigger: '.works-section',
								start: 'top top',
								end: () => `+=${getDistance()}`,
								pin: true,
								scrub: 1,
								invalidateOnRefresh: true,
							},
						});
					} else {
						gsap.from('.work-card', {
							y: 56,
							autoAlpha: 0,
							duration: 0.7,
							ease: 'power3.out',
							stagger: 0.1,
							scrollTrigger: { trigger: '.works-section', start: 'top 75%' },
						});
					}

					// ── Stats counters ──
					for (const el of gsap.utils.toArray<HTMLElement>('.stat-value')) {
						const target = Number(el.dataset.value ?? '0');
						const obj = { n: 0 };
						gsap.to(obj, {
							n: target,
							duration: 1.6,
							ease: 'power2.out',
							snap: { n: 1 },
							scrollTrigger: { trigger: el, start: 'top 88%' },
							onUpdate: () => {
								el.textContent = String(Math.round(obj.n));
							},
						});
					}

					// ── Client rows cascade ──
					gsap.from('.client-row', {
						x: -40,
						autoAlpha: 0,
						duration: 0.6,
						ease: 'power2.out',
						stagger: 0.08,
						scrollTrigger: { trigger: '.clients-list', start: 'top 85%' },
					});

					// ── Magnetic contact button ──
					if (magneticBtn) {
						const xTo = gsap.quickTo(magneticBtn, 'x', { duration: 0.4, ease: 'power3' });
						const yTo = gsap.quickTo(magneticBtn, 'y', { duration: 0.4, ease: 'power3' });
						const onBtnMove = (e: MouseEvent) => {
							const rect = magneticBtn.getBoundingClientRect();
							xTo((e.clientX - rect.left - rect.width / 2) * 0.35);
							yTo((e.clientY - rect.top - rect.height / 2) * 0.35);
						};
						const onBtnLeave = () => {
							xTo(0);
							yTo(0);
						};
						const zone = magneticBtn.parentElement ?? magneticBtn;
						zone.addEventListener('mousemove', onBtnMove);
						zone.addEventListener('mouseleave', onBtnLeave);
						magnetCleanup = () => {
							zone.removeEventListener('mousemove', onBtnMove);
							zone.removeEventListener('mouseleave', onBtnLeave);
						};
					}
				},
			);
		})();

		return () => {
			disposed = true;
			cleanupCanvas?.();
			magnetCleanup?.();
			mm?.revert();
		};
	});
</script>

<div bind:this={root} class="home overflow-x-clip">
	<!-- ═══ HERO ═══ -->
	<section class="hero relative flex min-h-[92svh] flex-col justify-center bg-[#181C38] text-white">
		<canvas bind:this={heroCanvas} class="absolute inset-0 h-full w-full" aria-hidden="true"
		></canvas>
		<div class="relative z-10 mx-auto w-full max-w-6xl px-6 py-24">
			<p class="hero-kicker mb-6 flex items-center gap-3 text-sm tracking-[0.2em] uppercase text-white/60">
				<Logo tilesOnly class="h-7 w-8" />
				{c.hero.kicker}
			</p>
			<h1 class="display-font text-[clamp(3rem,9vw,7.5rem)] leading-[1.02] font-bold">
				{#each c.hero.headline as line, i (i)}
					<span class="hero-line block overflow-hidden pb-[0.08em]">
						<span
							class="hero-line-inner block will-change-transform"
							class:text-[#5AEDC5]={i === c.hero.headline.length - 1}
						>
							{line}
						</span>
					</span>
				{/each}
			</h1>
			<p class="hero-sub mt-8 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl">
				{c.hero.sub}
			</p>
			<div class="mt-10 flex flex-wrap gap-4">
				<a
					href="#contact"
					class="hero-cta inline-flex items-center gap-2 rounded-full bg-[#5AEDC5] px-7 py-3.5 font-semibold text-[#181C38] transition-transform hover:scale-105"
				>
					{c.hero.cta}
					<span aria-hidden="true">→</span>
				</a>
				<a
					href="#works"
					class="hero-cta inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
				>
					{c.hero.ctaWorks}
				</a>
			</div>
		</div>
		<div class="hero-scroll-hint absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40">
			<span class="scroll-dot block h-8 w-[2px] rounded bg-current"></span>
		</div>
	</section>

	<!-- ═══ MARQUEE ═══ -->
	<div class="overflow-hidden border-y border-[#181C38]/10 bg-[#5AEDC5] py-4 text-[#181C38]">
		<!-- Two identical halves, no gap between them (each half carries its own
		     trailing padding) so the -50% GSAP loop wraps seamlessly. -->
		<div class="marquee-track flex w-max items-center whitespace-nowrap will-change-transform">
			{#each [0, 1] as half (half)}
				<div class="flex items-center gap-8 pr-8" aria-hidden={half === 1}>
					{#each c.marquee as word, i (i)}
						<span class="display-font text-xl font-bold tracking-tight uppercase">{word}</span>
						<span class="inline-block h-3 w-3 rotate-45 rounded-[3px] bg-[#181C38]" aria-hidden="true"
						></span>
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<!-- ═══ PILLARS ═══ -->
	<section class="bg-white py-24 text-[#181C38] md:py-32">
		<div class="mx-auto max-w-6xl px-6">
			<p class="reveal-up mb-4 text-sm font-semibold tracking-[0.2em] uppercase text-[#4F65F1]">
				{c.pillarsKicker}
			</p>
			<h2 class="reveal-up display-font max-w-4xl text-3xl leading-tight font-bold md:text-5xl">
				{c.pillarsTitle}
			</h2>
			<div class="pillar-grid mt-16 grid gap-6 md:grid-cols-2">
				{#each c.pillars as pillar (pillar.title)}
					<article
						class="pillar-card group rounded-2xl border border-[#181C38]/10 p-8 transition-shadow duration-300 hover:shadow-xl"
						style={`--accent:${pillar.color}`}
					>
						<span
							class="mb-6 block h-3 w-10 rounded-full transition-all duration-300 group-hover:w-16"
							style={`background:${pillar.color}`}
							aria-hidden="true"
						></span>
						<h3 class="display-font mb-3 text-xl font-bold md:text-2xl">{pillar.title}</h3>
						<p class="leading-relaxed text-[#181C38]/65">{pillar.description}</p>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- ═══ WORKS — pinned horizontal scroll ═══ -->
	<section id="works" class="works-section bg-[#181C38] text-white">
		<div bind:this={worksViewport} class="flex min-h-svh flex-col justify-center overflow-hidden py-20">
			<div class="mx-auto mb-12 w-full max-w-6xl px-6">
				<p class="reveal-up mb-4 text-sm font-semibold tracking-[0.2em] uppercase text-[#5AEDC5]">
					{c.worksKicker}
				</p>
				<h2 class="reveal-up display-font text-3xl font-bold md:text-5xl">{c.worksTitle}</h2>
			</div>
			<div
				bind:this={worksTrack}
				class="works-track flex flex-col gap-6 px-6 will-change-transform md:flex-row md:px-[max(1.5rem,calc((100vw-72rem)/2))]"
			>
				{#each c.works as work, i (work.key)}
					<article
						class="work-card group relative flex w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur md:w-[30rem]"
					>
						{#if work.image}
							<div class="relative aspect-[16/9] overflow-hidden">
								<img
									src={work.image}
									alt={`${work.name} — ${work.tagline}`}
									loading="lazy"
									class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-[#181C38]/80 to-transparent"
									aria-hidden="true"
								></div>
								<span
									class="display-font absolute top-4 left-5 text-sm font-bold text-white/50"
									>{String(i + 1).padStart(2, '0')}</span
								>
							</div>
						{/if}
						<div class="flex flex-1 flex-col p-7 pt-5 md:p-8 md:pt-5">
							<h3 class="display-font text-2xl font-bold md:text-3xl">{work.name}</h3>
							<p class="mt-1 text-sm font-medium md:text-base" style={`color:${work.color}`}>
								{work.tagline}
							</p>
							<p class="mt-3 text-sm leading-relaxed text-white/65">
								{work.description}
							</p>
						</div>
						<div class="flex flex-wrap items-center gap-2 p-7 pt-0 md:p-8 md:pt-0">
							{#each work.tags as tag (tag)}
								<span class="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60"
									>{tag}</span
								>
							{/each}
							{#if work.href}
								<a
									href={work.href}
									target="_blank"
									rel="noopener noreferrer"
									class="ml-auto inline-flex items-center gap-1 text-sm font-semibold transition-colors"
									style={`color:${work.color}`}
								>
									Visit <span aria-hidden="true">↗</span>
								</a>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<!-- ═══ STATS ═══ -->
	<section class="border-b border-[#181C38]/10 bg-white py-20 text-[#181C38]">
		<div class="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 md:grid-cols-4">
			{#each c.stats as stat (stat.label)}
				<div>
					<p class="display-font text-5xl font-bold md:text-6xl">
						{stat.prefix ?? ''}<span class="stat-value" data-value={stat.value}>{stat.value}</span
						>{stat.suffix}
					</p>
					<p class="mt-2 text-sm leading-snug text-[#181C38]/60">{stat.label}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ═══ CLIENTS ═══ -->
	<section class="bg-white py-24 text-[#181C38]">
		<div class="mx-auto max-w-6xl px-6">
			<p class="reveal-up mb-10 text-sm font-semibold tracking-[0.2em] uppercase text-[#FA8098]">
				{c.clientsTitle}
			</p>
			<ul class="clients-list grid grid-cols-2 overflow-hidden rounded-2xl border border-[#181C38]/10 sm:grid-cols-3 lg:grid-cols-5">
				{#each c.clients as client, i (client)}
					<li
						class="client-row group -mt-px -ml-px flex min-h-28 cursor-default items-center justify-center border-t border-l border-[#181C38]/10 px-4 py-8 text-center transition-colors duration-300"
						style={`--accent:${[BRAND.mint, BRAND.cyan, BRAND.pink, BRAND.indigo, BRAND.amber][i % 5]}`}
					>
						<span
							class="display-font text-lg font-bold text-[#181C38]/55 transition-all duration-300 group-hover:scale-110 group-hover:text-[var(--accent)] md:text-xl"
							>{client}</span
						>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- ═══ CONTACT ═══ -->
	<section id="contact" class="bg-[#181C38] py-28 text-white md:py-36">
		<div class="mx-auto max-w-6xl px-6 text-center">
			<p class="reveal-up mb-4 text-sm font-semibold tracking-[0.2em] uppercase text-[#FFC15D]">
				{c.contact.kicker}
			</p>
			<h2 class="reveal-up display-font text-4xl leading-tight font-bold md:text-7xl">
				{c.contact.headline}
			</h2>
			<p class="reveal-up mx-auto mt-6 max-w-xl text-lg text-white/60">{c.contact.sub}</p>
			<div class="reveal-up mt-12 inline-block p-8">
				<a
					bind:this={magneticBtn}
					href={`mailto:${c.contact.email}`}
					class="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-[#181C38] will-change-transform"
				>
					{c.contact.cta}
					<span aria-hidden="true">→</span>
				</a>
			</div>
			<p class="reveal-up mt-10 text-sm text-white/40">{c.contact.address}</p>
		</div>
	</section>
</div>

<style>
	.display-font {
		font-family:
			'Space Grotesk',
			'IBM Plex Sans Thai',
			system-ui,
			sans-serif;
		letter-spacing: -0.02em;
	}
	.scroll-dot {
		animation: scroll-pulse 1.8s ease-in-out infinite;
		transform-origin: top;
	}
	@keyframes scroll-pulse {
		0%,
		100% {
			transform: scaleY(0.3);
			opacity: 0.4;
		}
		50% {
			transform: scaleY(1);
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.scroll-dot {
			animation: none;
		}
	}
</style>
