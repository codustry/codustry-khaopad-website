<script lang="ts">
	/* eslint-disable svelte/no-useless-mustaches --
	 * The {' '} mustaches are deliberate: they emit exactly one space
	 * between animated word spans, keeping SSR output byte-identical to
	 * the pre-contract markup. A literal space here would be re-indented
	 * by prettier and change the emitted bytes. */
	/**
	 * Codustry homepage body — deployment-owned (#174 Step 6 home seam).
	 *
	 * Moved verbatim from the forked `(www)/[locale]/+page.svelte` so the
	 * route file can be upstream's resolver shell again. Registered via
	 * `setChrome({ home })` in `$lib/deployment/chrome.ts`.
	 */
	import { onMount } from 'svelte';
	import * as m from '$lib/paraglide/messages';
	import { toLocale } from '$lib/i18n';
	import { homeContent, BRAND } from '$lib/marketing/content';
	import type { HomePageProps } from '$lib/components/www/chrome';

	let { data }: HomePageProps = $props();
	const locale = $derived.by(() => toLocale(data.locale));
	const c = $derived.by(() => homeContent(locale));

	// ─── Contact form → /api/forms/contact ─────────
	let formState = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
	async function submitContact(e: SubmitEvent) {
		e.preventDefault();
		const formEl = e.currentTarget as HTMLFormElement;
		formState = 'sending';
		try {
			const res = await fetch('/api/forms/contact', {
				method: 'POST',
				body: new FormData(formEl),
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			formState = 'success';
			formEl.reset();
		} catch {
			formState = 'error';
		}
	}

	// Hero thumbnails — the work itself is the hero (Ogilvy-style),
	// drifting slowly behind the statement headline.
	const heroThumbs = $derived.by(() =>
		c.works.filter((w) => w.image).map((w) => ({ key: w.key, image: w.image!, name: w.name })),
	);
	// Sparse, asymmetric placement (vw/vh percentages) + per-thumb drift depth.
	const thumbLayout = [
		{ x: 4, y: 12, w: 15, depth: 0.6 },
		{ x: 78, y: 8, w: 17, depth: 1.0 },
		{ x: 86, y: 58, w: 13, depth: 0.5 },
		{ x: 8, y: 66, w: 14, depth: 0.9 },
		{ x: 62, y: 76, w: 15, depth: 0.7 },
		{ x: 30, y: 4, w: 12, depth: 0.4 },
	];

	let magneticBtn: HTMLAnchorElement | undefined = $state();
	let heroCanvas: HTMLCanvasElement | undefined = $state();


	// ─── Hero canvas: interactive diamond lattice (light theme) ─────────
	// The logo's diamond-tile motif as a quiet ink dot-grid; tiles near the
	// pointer bloom into the brand colors and swell. Pure canvas + rAF.
	function startLattice(canvas: HTMLCanvasElement) {
		const ctx = canvas.getContext('2d');
		if (!ctx) return () => {};
		const palette = [BRAND.mint, BRAND.cyan, BRAND.pink, BRAND.indigo, BRAND.amber];
		let raf = 0;
		let running = true;
		let w = 0,
			h = 0;
		const pointer = { x: -9999, y: -9999 };
		let t = 0;
		type Tile = { x: number; y: number; color: string; phase: number };
		let tiles: Tile[] = [];
		const GAP = 52;

		function layout() {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
					tiles.push({
						x: col * GAP + (r % 2 === 0 ? 0 : GAP / 2),
						y: r * GAP,
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
				const dist = Math.hypot(tile.x - pointer.x, tile.y - pointer.y);
				const near = Math.max(0, 1 - dist / 200);
				const breathe = 0.5 + 0.5 * Math.sin(t * 1.1 + tile.phase * Math.PI * 2);
				const alpha = 0.05 + breathe * 0.04 + near * 0.75;
				const size = 4 + near * 10;
				ctx!.save();
				ctx!.translate(tile.x, tile.y);
				ctx!.rotate(Math.PI / 4);
				ctx!.globalAlpha = alpha;
				ctx!.fillStyle = near > 0.03 ? tile.color : '#181C38';
				ctx!.beginPath();
				ctx!.roundRect(-size / 2, -size / 2, size, size, 1.5 + near * 2);
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
		const zone = canvas.parentElement;
		zone?.addEventListener('pointermove', onMove);
		zone?.addEventListener('pointerleave', onLeave);
		return () => {
			running = false;
			cancelAnimationFrame(raf);
			ro.disconnect();
			io.disconnect();
			zone?.removeEventListener('pointermove', onMove);
			zone?.removeEventListener('pointerleave', onLeave);
		};
	}

	// ─── Text scramble: story titles decode on hover ─────────
	function attachScramble(el: HTMLElement): () => void {
		const original = el.textContent ?? '';
		const glyphs = '◆◇▪▫#/<>*+=01';
		let interval: ReturnType<typeof setInterval> | undefined;
		const play = () => {
			if (interval) return;
			const units = charsOf(original);
			let frame = 0;
			const total = 12;
			interval = setInterval(() => {
				frame++;
				const reveal = Math.floor(units.length * (frame / total));
				el.textContent = units
					.map((ch, i) =>
						i < reveal || ch === ' ' ? ch : glyphs[Math.floor(Math.random() * glyphs.length)],
					)
					.join('');
				if (frame >= total) {
					clearInterval(interval!);
					interval = undefined;
					el.textContent = original;
				}
			}, 28);
		};
		el.addEventListener('mouseenter', play);
		return () => {
			if (interval) clearInterval(interval);
			el.removeEventListener('mouseenter', play);
			el.textContent = original;
		};
	}

	onMount(() => {
		let disposed = false;
		let mm: { revert: () => void } | undefined;
		let magnetCleanup: (() => void) | undefined;

		// `?noanim` renders the finished page with no motion — for visual QA
		// and screenshot tooling (headless tabs pause rAF, freezing tweens).
		if (new URLSearchParams(window.location.search).has('noanim')) return;

		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger'),
			]);
			if (disposed) return;
			gsap.registerPlugin(ScrollTrigger);

			const matchMedia = gsap.matchMedia();
			mm = matchMedia;

			matchMedia.add(
				{
					reduced: '(prefers-reduced-motion: reduce)',
					motion: '(prefers-reduced-motion: no-preference)',
				},
				(mmCtx) => {
					const { reduced: isReduced } = mmCtx.conditions as { reduced: boolean };
					if (isReduced) return;

					// ── Interactive lattice + scramble hovers ──
					const extraCleanups: Array<() => void> = [];
					if (heroCanvas) extraCleanups.push(startLattice(heroCanvas));
					for (const el of gsap.utils.toArray<HTMLElement>('.work-story-title')) {
						extraCleanups.push(attachScramble(el));
					}

					// ── Hero: char-stagger reveal of the statement ──
					const chars = gsap.utils.toArray<HTMLElement>('.hero-char');
					gsap
						.timeline({ defaults: { ease: 'power4.out' } })
						.from('.hero-kicker', { y: 16, autoAlpha: 0, duration: 0.6 }, 0.1)
						.from(
							chars,
							{
								yPercent: 105,
								duration: 0.9,
								stagger: { each: 0.018, from: 'start' },
							},
							0.15,
						)
						.from('.hero-sub', { y: 20, autoAlpha: 0, duration: 0.7 }, '-=0.45')
						.from('.hero-links a', { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.08 }, '-=0.4')
						.from('.hero-thumb', { autoAlpha: 0, scale: 0.92, duration: 1.1, stagger: 0.07 }, 0.5);

					// ── Hero thumbs: slow parallax drift on scroll + mouse ──
					for (const el of gsap.utils.toArray<HTMLElement>('.hero-thumb')) {
						const depth = Number(el.dataset.depth ?? '0.6');
						gsap.to(el, {
							yPercent: -30 * depth * 3,
							ease: 'none',
							scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
						});
					}
					const hero = document.querySelector<HTMLElement>('.hero');
					if (hero) {
						// Thumbs drift AND tilt in 3D toward the pointer, by depth.
						const quicks = gsap.utils
							.toArray<HTMLElement>('.hero-thumb')
							.map((el) => ({
								x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }),
								y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }),
								rx: gsap.quickTo(el, 'rotationX', { duration: 1.0, ease: 'power3' }),
								ry: gsap.quickTo(el, 'rotationY', { duration: 1.0, ease: 'power3' }),
								depth: Number(el.dataset.depth ?? '0.6'),
							}));
						gsap.set('.hero-thumb', { transformPerspective: 800 });
						const onMove = (e: MouseEvent) => {
							const cx = e.clientX / window.innerWidth - 0.5;
							const cy = e.clientY / window.innerHeight - 0.5;
							for (const q of quicks) {
								q.x(cx * -30 * q.depth);
								q.y(cy * -20 * q.depth);
								q.ry(cx * 14 * q.depth);
								q.rx(cy * -10 * q.depth);
							}
						};
						hero.addEventListener('mousemove', onMove);
						magnetCleanup = () => hero.removeEventListener('mousemove', onMove);
					}

					// ── Marquee — eases to a crawl while hovered ──
					const marqueeTween = gsap.to('.marquee-track', {
						xPercent: -50,
						ease: 'none',
						duration: 30,
						repeat: -1,
					});
					const marqueeZone = document.querySelector<HTMLElement>('.marquee-zone');
					if (marqueeZone) {
						const slow = () => gsap.to(marqueeTween, { timeScale: 0.12, duration: 0.6 });
						const fast = () => gsap.to(marqueeTween, { timeScale: 1, duration: 0.9 });
						marqueeZone.addEventListener('mouseenter', slow);
						marqueeZone.addEventListener('mouseleave', fast);
						extraCleanups.push(() => {
							marqueeZone.removeEventListener('mouseenter', slow);
							marqueeZone.removeEventListener('mouseleave', fast);
						});
					}

					// ── Manifesto stanzas ──
					gsap.from('.manifesto-line', {
						y: 44,
						autoAlpha: 0,
						duration: 0.9,
						ease: 'power3.out',
						stagger: 0.18,
						scrollTrigger: { trigger: '.manifesto-line', start: 'top 80%' },
					});

					// ── Generic scroll reveals ──
					for (const el of gsap.utils.toArray<HTMLElement>('.reveal-up')) {
						gsap.from(el, {
							y: 36,
							autoAlpha: 0,
							duration: 0.8,
							ease: 'power3.out',
							scrollTrigger: { trigger: el, start: 'top 88%' },
						});
					}

					// ── Work rows: image clip-reveal + inner parallax while scrolling ──
					for (const row of gsap.utils.toArray<HTMLElement>('.work-row')) {
						const img = row.querySelector('.work-image');
						if (img) {
							gsap.from(img, {
								clipPath: 'inset(0 0 100% 0)',
								duration: 1.1,
								ease: 'power3.inOut',
								scrollTrigger: { trigger: row, start: 'top 80%' },
							});
							gsap.fromTo(
								img,
								{ scale: 1.12, yPercent: -5 },
								{
									scale: 1.12,
									yPercent: 5,
									ease: 'none',
									scrollTrigger: {
										trigger: row,
										start: 'top bottom',
										end: 'bottom top',
										scrub: 0.4,
									},
								},
							);
						}
						gsap.from(row.querySelectorAll('.work-copy > *'), {
							y: 28,
							autoAlpha: 0,
							duration: 0.7,
							ease: 'power3.out',
							stagger: 0.07,
							scrollTrigger: { trigger: row, start: 'top 75%' },
						});
					}

					// ── Service rows cascade ──
					gsap.from('.service-row', {
						y: 32,
						autoAlpha: 0,
						duration: 0.6,
						ease: 'power2.out',
						stagger: 0.08,
						scrollTrigger: { trigger: '.services-list', start: 'top 82%' },
					});

					// ── Stats counters (decimal-aware: "3.5" counts in tenths) ──
					for (const el of gsap.utils.toArray<HTMLElement>('.stat-value')) {
						const raw = el.dataset.value ?? '0';
						const target = Number(raw);
						const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
						const step = decimals > 0 ? 1 / 10 ** decimals : 1;
						const obj = { n: 0 };
						gsap.to(obj, {
							n: target,
							duration: 1.4,
							ease: 'power2.out',
							snap: { n: step },
							scrollTrigger: { trigger: el, start: 'top 90%' },
							onUpdate: () => {
								el.textContent = obj.n.toFixed(decimals);
							},
						});
					}

					// ── Magnetic contact link ──
					if (magneticBtn) {
						const xTo = gsap.quickTo(magneticBtn, 'x', { duration: 0.4, ease: 'power3' });
						const yTo = gsap.quickTo(magneticBtn, 'y', { duration: 0.4, ease: 'power3' });
						const zone = magneticBtn.parentElement ?? magneticBtn;
						const onBtnMove = (e: MouseEvent) => {
							const rect = magneticBtn!.getBoundingClientRect();
							xTo((e.clientX - rect.left - rect.width / 2) * 0.25);
							yTo((e.clientY - rect.top - rect.height / 2) * 0.25);
						};
						const onBtnLeave = () => {
							xTo(0);
							yTo(0);
						};
						zone.addEventListener('mousemove', onBtnMove);
						zone.addEventListener('mouseleave', onBtnLeave);
						const prev = magnetCleanup;
						magnetCleanup = () => {
							prev?.();
							zone.removeEventListener('mousemove', onBtnMove);
							zone.removeEventListener('mouseleave', onBtnLeave);
						};
					}

					// matchMedia calls this on revert — tears down canvas/scramble/marquee hovers.
					return () => extraCleanups.forEach((fn) => fn());
				},
			);
		})();

		return () => {
			disposed = true;
			magnetCleanup?.();
			mm?.revert();
		};
	});

	/**
	 * Split a headline line into animatable units. Grapheme clusters, not code
	 * points — Thai combining vowels/tone marks (สระ/วรรณยุกต์) must stay in the
	 * same span as their base character or the text shaping breaks.
	 */
	const graphemeSegmenter =
		typeof Intl !== 'undefined' && 'Segmenter' in Intl
			? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
			: null;
	function charsOf(line: string): string[] {
		return graphemeSegmenter
			? [...graphemeSegmenter.segment(line)].map((s) => s.segment)
			: [...line];
	}
</script>

<div class="home bg-white text-[#181C38]">
	<!-- ═══ HERO — the work drifts behind the statement ═══ -->
	<section class="hero relative flex min-h-[92svh] items-center overflow-hidden">
		<!-- Interactive diamond lattice — quiet ink dots that bloom brand colors near the pointer -->
		<canvas bind:this={heroCanvas} class="absolute inset-0 h-full w-full" aria-hidden="true"
		></canvas>
		<!-- Drifting work thumbnails -->
		<div class="absolute inset-0" aria-hidden="true">
			{#each heroThumbs as thumb, i (thumb.key)}
				{@const l = thumbLayout[i % thumbLayout.length]}
				<img
					src={thumb.image}
					alt=""
					loading="eager"
					data-depth={l.depth}
					class="hero-thumb absolute rounded-md opacity-90 shadow-sm will-change-transform"
					style={`left:${l.x}vw; top:${l.y}vh; width:${l.w}vw; min-width:7rem;`}
				/>
			{/each}
			<div class="absolute inset-0 bg-white/55"></div>
		</div>

		<div class="relative z-10 mx-auto w-full max-w-7xl px-6 py-24">
			<p class="hero-kicker mb-8 text-xs font-medium tracking-[0.25em] uppercase text-[#181C38]/50">
				{c.hero.kicker}
			</p>
			<h1
				class="display-font text-[clamp(2.4rem,7.2vw,6.5rem)] leading-[1.04] font-medium tracking-tight text-balance uppercase"
			>
				{#each c.hero.headline as line, li (li)}
					<span class="block">
						<!-- Words stay unbreakable; graphemes inside animate individually. -->
						{#each line.split(' ') as word, wi (wi)}
							<span class="inline-block whitespace-nowrap"
								>{#each charsOf(word) as ch, ci (ci)}<span
										class="inline-block overflow-hidden align-bottom"
										><span class="hero-char inline-block will-change-transform">{ch}</span></span
									>{/each}</span
							>{#if wi < line.split(' ').length - 1}{' '}{/if}
						{/each}
					</span>
				{/each}
			</h1>
			<div class="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
				<p class="hero-sub max-w-xl text-base leading-relaxed text-[#181C38]/65 md:text-lg">
					{c.hero.sub}
				</p>
				<div class="hero-links flex shrink-0 items-center gap-8 text-sm font-medium">
					<a href="#works" class="link-underline">{c.hero.ctaWorks} ↓</a>
					<a href="#contact" class="link-underline text-[#181C38]">{c.hero.cta} →</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ═══ MARQUEE — monochrome, tiny color hits ═══ -->
	<div class="marquee-zone overflow-hidden border-y border-[#181C38]/10 py-3" aria-hidden="true">
		<div class="marquee-track flex w-max items-center whitespace-nowrap will-change-transform">
			{#each [0, 1] as half (half)}
				<div class="flex items-center gap-10 pr-10">
					{#each c.marquee as word, i (i)}
						<span class="text-sm font-medium tracking-[0.18em] uppercase text-[#181C38]/60"
							>{word}</span
						>
						<span
							class="inline-block h-1.5 w-1.5 rotate-45 rounded-[2px]"
							style={`background:${[BRAND.mint, BRAND.cyan, BRAND.pink, BRAND.indigo, BRAND.amber][i % 5]}`}
						></span>
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<!-- ═══ MANIFESTO — the story, told big (Ogilvy About-page style) ═══ -->
	<section class="mx-auto max-w-5xl px-6 py-28 md:py-40">
		{#each c.manifesto as stanza, i (i)}
			<p
				class={`manifesto-line display-font leading-snug font-medium tracking-tight text-pretty ${
					i === 0
						? 'text-3xl md:text-5xl'
						: i === c.manifesto.length - 1
							? 'mt-10 text-2xl underline decoration-[#5AEDC5] decoration-[3px] underline-offset-8 md:text-3xl'
							: 'mt-10 max-w-3xl text-xl text-[#181C38]/70 md:text-2xl'
				}`}
			>
				{stanza}
			</p>
		{/each}
	</section>

	<!-- ═══ WORKS — editorial rows ═══ -->
	<section id="works" class="mx-auto max-w-7xl px-6 py-24 md:py-32">
		<p class="reveal-up mb-3 text-xs font-medium tracking-[0.25em] uppercase text-[#181C38]/50">
			{c.worksKicker}
		</p>
		<h2 class="reveal-up display-font text-3xl font-medium tracking-tight md:text-5xl">
			{c.worksTitle}
		</h2>

		<div class="mt-16 flex flex-col gap-20 md:gap-28">
			{#each c.works as work, i (work.key)}
				<article
					class="work-row grid items-center gap-8 border-t border-[#181C38]/10 pt-10 md:grid-cols-12 md:gap-12"
				>
					<div
						class={`overflow-hidden rounded-lg md:col-span-7 ${i % 2 === 1 ? 'md:order-2 md:col-start-6' : ''}`}
					>
						{#if work.image}
							<a
								href={work.href ?? '#contact'}
								target={work.href ? '_blank' : undefined}
								rel={work.href ? 'noopener noreferrer' : undefined}
								class="group block"
								aria-label={work.name}
							>
								<img
									src={work.image}
									alt={`${work.name} — ${work.tagline}`}
									loading="lazy"
									class="work-image aspect-[16/9] w-full rounded-lg object-cover will-change-transform"
								/>
							</a>
						{/if}
					</div>
					<div class={`work-copy md:col-span-5 ${i % 2 === 1 ? 'md:order-1 md:col-start-1' : ''}`}>
						<p class="text-xs font-medium tracking-[0.25em] text-[#181C38]/40 uppercase">
							{String(i + 1).padStart(2, '0')} — {work.name}
						</p>
						<h3
							class="display-font mt-3 text-3xl font-medium tracking-tight text-balance md:text-4xl"
						>
							<span class="work-story-title" data-cursor>{work.story}</span>
						</h3>
						<p class="mt-1 text-sm font-medium" style={`color:${work.color}`}>{work.tagline}</p>
						<p class="mt-4 leading-relaxed text-[#181C38]/65">{work.description}</p>
						<p class="mt-5 text-xs tracking-wide text-[#181C38]/45 uppercase">
							{work.tags.join('  ·  ')}
						</p>
						{#if work.href}
							<a
								href={work.href}
								target="_blank"
								rel="noopener noreferrer"
								class="link-underline mt-5 inline-block text-sm font-medium"
							>
								Visit ↗
							</a>
						{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- ═══ SERVICES — numbered list ═══ -->
	<section id="services" class="mx-auto max-w-7xl px-6 py-24 md:py-32">
		<p class="reveal-up mb-3 text-xs font-medium tracking-[0.25em] uppercase text-[#181C38]/50">
			{c.pillarsKicker}
		</p>
		<h2
			class="reveal-up display-font max-w-3xl text-3xl leading-snug font-medium tracking-tight md:text-4xl"
		>
			{c.pillarsTitle}
		</h2>
		<div class="services-list mt-14">
			{#each c.pillars as pillar, i (pillar.title)}
				<div
					class="service-row group grid gap-2 border-t border-[#181C38]/10 py-7 md:grid-cols-12 md:gap-8"
				>
					<p class="text-xs font-medium tracking-[0.25em] text-[#181C38]/40 md:col-span-1 md:pt-1.5">
						{String(i + 1).padStart(2, '0')}
					</p>
					<h3
						class="display-font text-xl font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-2 md:col-span-5 md:text-2xl"
					>
						{pillar.title}
						<span
							class="ml-2 inline-block h-2 w-2 rotate-45 rounded-[2px] align-middle opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							style={`background:${pillar.color}`}
							aria-hidden="true"
						></span>
					</h3>
					<p class="leading-relaxed text-[#181C38]/60 md:col-span-6">{pillar.description}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ═══ STATS — one thin row ═══ -->
	<section class="border-y border-[#181C38]/10">
		<div class="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4">
			{#each c.stats as stat (stat.label)}
				<div>
					<p class="display-font text-4xl font-medium tracking-tight md:text-5xl">
						{stat.prefix ?? ''}<span class="stat-value" data-value={stat.value}>{stat.value}</span
						>{stat.suffix}
					</p>
					<p class="mt-2 max-w-[16rem] text-sm leading-snug text-[#181C38]/55">{stat.label}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ═══ CLIENTS — quiet name wall ═══ -->
	<section id="clients" class="mx-auto max-w-7xl px-6 py-24">
		<p class="reveal-up mb-10 text-xs font-medium tracking-[0.25em] uppercase text-[#181C38]/50">
			{c.clientsTitle}
		</p>
		<ul class="reveal-up flex flex-wrap items-center gap-x-14 gap-y-10">
			{#each c.clients as client, i (client.name)}
				<li class="group flex items-center gap-3">
					{#if client.logo}
						<!-- `darken` renders light/cream marks as a dark silhouette (no color on
						     hover — their true colors are invisible on white). -->
						<img
							src={client.logo}
							alt={`${client.name} logo`}
							title={client.name}
							class={`${client.logoClass ?? 'h-9'} w-auto transition-all duration-300 ${
								client.darken
									? 'opacity-70 [filter:brightness(0.35)_grayscale(1)] group-hover:opacity-90'
									: 'opacity-55 grayscale group-hover:opacity-100 group-hover:grayscale-0'
							}`}
						/>
						{#if client.withName}
							<!-- Icon-only marks carry their name so the brand stays identifiable. -->
							<span
								class="display-font text-lg font-medium text-[#181C38]/40 transition-colors duration-300 group-hover:text-[#181C38]/70 md:text-xl"
								>{client.name}</span
							>
						{/if}
					{:else}
						<span
							class="display-font client-name cursor-default text-xl font-medium text-[#181C38]/35 transition-colors duration-300 md:text-2xl"
							style={`--accent:${[BRAND.mint, BRAND.cyan, BRAND.pink, BRAND.indigo, BRAND.amber][i % 5]}`}
							>{client.name}</span
						>
					{/if}
				</li>
			{/each}
		</ul>

	</section>

	<!-- ═══ DISTRIBUTION — official brands, each with its sales channel highlighted ═══ -->
	<section class="border-t border-[#181C38]/10">
		<div class="mx-auto max-w-7xl px-6 py-20 md:py-24">
			<p class="reveal-up mb-4 text-xs font-medium tracking-[0.25em] uppercase text-[#181C38]/50">
				{c.distributionTitle}
			</p>
			<p class="reveal-up mb-12 max-w-2xl text-lg text-[#181C38]/65">{c.distributionSub}</p>
			<ul class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
				{#each c.distribution as brand (brand.name)}
					<li
						class="reveal-up group flex flex-col justify-between rounded-2xl border border-[#181C38]/10 p-8 transition-shadow duration-300 hover:shadow-xl"
					>
						<div>
							<div class="flex h-12 items-center">
								<img
									src={brand.logo}
									alt={`${brand.name} logo`}
									class={`${brand.logoClass} opacity-70 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0`}
									loading="lazy"
								/>
							</div>
							<p class="mt-5 leading-relaxed text-[#181C38]/65">{brand.note}</p>
						</div>
						<a
							href={brand.channelHref}
							target={brand.channelHref.startsWith('http') ? '_blank' : undefined}
							rel={brand.channelHref.startsWith('http') ? 'noopener noreferrer' : undefined}
							class="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4 transition-colors"
							style={`text-decoration-color:${brand.color}`}
						>
							{brand.channelLabel}
							<span aria-hidden="true">→</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- ═══ CONTACT ═══ -->
	<section id="contact" class="border-t border-[#181C38]/10">
		<div class="mx-auto max-w-7xl px-6 py-28 md:py-36">
			<p class="reveal-up mb-3 text-xs font-medium tracking-[0.25em] uppercase text-[#181C38]/50">
				{c.contact.kicker}
			</p>
			<h2
				class="reveal-up display-font max-w-4xl text-[clamp(2.2rem,6vw,4.8rem)] leading-[1.06] font-medium tracking-tight"
			>
				{c.contact.headline}
			</h2>
			<p class="reveal-up mt-6 max-w-xl text-lg text-[#181C38]/60">{c.contact.sub}</p>

			<div class="mt-14 grid gap-14 md:grid-cols-2 md:gap-20">
				<!-- Simple contact form → /api/forms/contact (stored in the CMS,
				     emailed to hello@ via Resend when configured) -->
				<form class="reveal-up flex flex-col gap-5" onsubmit={submitContact}>
					<label class="flex flex-col gap-2">
						<span class="text-xs font-medium tracking-[0.2em] uppercase text-[#181C38]/50"
							>{m.form_name()}</span
						>
						<input
							name="name"
							required
							maxlength="120"
							class="rounded-lg border border-[#181C38]/15 bg-white px-4 py-3 transition-colors outline-none focus:border-[#4F65F1]"
						/>
					</label>
					<label class="flex flex-col gap-2">
						<span class="text-xs font-medium tracking-[0.2em] uppercase text-[#181C38]/50"
							>{m.form_email()}</span
						>
						<input
							name="email"
							type="email"
							required
							maxlength="200"
							class="rounded-lg border border-[#181C38]/15 bg-white px-4 py-3 transition-colors outline-none focus:border-[#4F65F1]"
						/>
					</label>
					<label class="flex flex-col gap-2">
						<span class="text-xs font-medium tracking-[0.2em] uppercase text-[#181C38]/50"
							>{m.form_message()}</span
						>
						<textarea
							name="message"
							required
							rows="5"
							maxlength="4000"
							class="resize-y rounded-lg border border-[#181C38]/15 bg-white px-4 py-3 transition-colors outline-none focus:border-[#4F65F1]"
						></textarea>
					</label>
					<!-- Honeypot (name must match HONEYPOT_FIELD) — humans never
					     see it; bots fill it and get silently dropped. -->
					<input
						type="text"
						name="_hp"
						tabindex="-1"
						autocomplete="off"
						aria-hidden="true"
						class="absolute -left-[9999px] h-0 w-0 opacity-0"
					/>
					<button
						type="submit"
						disabled={formState === 'sending'}
						class="mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#181C38] px-8 py-3.5 font-medium text-white transition-colors hover:bg-[#181C38]/85 disabled:opacity-60"
					>
						{formState === 'sending' ? m.form_sending() : m.form_send()}
						<span aria-hidden="true">→</span>
					</button>
					{#if formState === 'success'}
						<p class="text-sm font-medium text-[#181C38]" role="status">✓ {m.form_success()}</p>
					{:else if formState === 'error'}
						<p class="text-sm font-medium text-[#FA8098]" role="alert">{m.form_error()}</p>
					{/if}
				</form>

				<!-- Direct lines -->
				<div class="reveal-up flex flex-col gap-8">
					<a
						bind:this={magneticBtn}
						href={`mailto:${c.contact.email}`}
						class="display-font inline-block w-fit text-2xl font-medium underline decoration-[#5AEDC5] decoration-2 underline-offset-8 will-change-transform hover:decoration-4 md:text-3xl"
					>
						{c.contact.cta}
					</a>
					<a
						href={c.contact.phoneHref}
						class="display-font inline-block w-fit text-2xl font-medium underline decoration-[#25CBFF] decoration-2 underline-offset-8 hover:decoration-4 md:text-3xl"
					>
						{c.contact.phone}
					</a>
					<a
						href={c.contact.mapsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="max-w-xs text-sm leading-relaxed text-[#181C38]/55 underline decoration-[#181C38]/20 underline-offset-4 transition-colors hover:text-[#181C38]"
					>
						{c.contact.address} ↗
					</a>
				</div>
			</div>
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
	}
	.link-underline {
		position: relative;
	}
	.link-underline::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: -3px;
		height: 1.5px;
		width: 100%;
		background: currentColor;
		transform: scaleX(0);
		transform-origin: right;
		transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.link-underline:hover::after {
		transform: scaleX(1);
		transform-origin: left;
	}
	.client-name:hover {
		color: var(--accent);
	}
</style>
