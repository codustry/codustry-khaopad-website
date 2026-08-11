<script lang="ts">
	import { onMount } from 'svelte';
	import { toLocale } from '$lib/i18n';
	import { homeContent, BRAND } from '$lib/marketing/content';

	let { data } = $props();
	const locale = $derived.by(() => toLocale(data.locale));
	const c = $derived.by(() => homeContent(locale));

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
						const quicks = gsap.utils
							.toArray<HTMLElement>('.hero-thumb')
							.map((el) => ({
								x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3' }),
								y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3' }),
								depth: Number(el.dataset.depth ?? '0.6'),
							}));
						const onMove = (e: MouseEvent) => {
							const cx = e.clientX / window.innerWidth - 0.5;
							const cy = e.clientY / window.innerHeight - 0.5;
							for (const q of quicks) {
								q.x(cx * -30 * q.depth);
								q.y(cy * -20 * q.depth);
							}
						};
						hero.addEventListener('mousemove', onMove);
						magnetCleanup = () => hero.removeEventListener('mousemove', onMove);
					}

					// ── Marquee ──
					gsap.to('.marquee-track', { xPercent: -50, ease: 'none', duration: 30, repeat: -1 });

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

					// ── Work rows: image clip-reveal + slight parallax ──
					for (const row of gsap.utils.toArray<HTMLElement>('.work-row')) {
						const img = row.querySelector('.work-image');
						if (img) {
							gsap.from(img, {
								clipPath: 'inset(0 0 100% 0)',
								duration: 1.1,
								ease: 'power3.inOut',
								scrollTrigger: { trigger: row, start: 'top 80%' },
							});
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

					// ── Stats counters ──
					for (const el of gsap.utils.toArray<HTMLElement>('.stat-value')) {
						const target = Number(el.dataset.value ?? '0');
						const obj = { n: 0 };
						gsap.to(obj, {
							n: target,
							duration: 1.4,
							ease: 'power2.out',
							snap: { n: 1 },
							scrollTrigger: { trigger: el, start: 'top 90%' },
							onUpdate: () => {
								el.textContent = String(Math.round(obj.n));
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
	<div class="overflow-hidden border-y border-[#181C38]/10 py-3" aria-hidden="true">
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
									class="work-image aspect-[16/9] w-full rounded-lg object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
								/>
							</a>
						{/if}
					</div>
					<div class={`work-copy md:col-span-5 ${i % 2 === 1 ? 'md:order-1 md:col-start-1' : ''}`}>
						<p class="text-xs font-medium tracking-[0.25em] text-[#181C38]/40 uppercase">
							{String(i + 1).padStart(2, '0')} — {work.name}
						</p>
						<h3 class="display-font mt-3 text-3xl font-medium tracking-tight text-balance md:text-4xl">
							{work.story}
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
		<ul class="reveal-up flex flex-wrap gap-x-10 gap-y-5">
			{#each c.clients as client, i (client)}
				<li>
					<span
						class="display-font client-name cursor-default text-xl font-medium text-[#181C38]/35 transition-colors duration-300 md:text-2xl"
						style={`--accent:${[BRAND.mint, BRAND.cyan, BRAND.pink, BRAND.indigo, BRAND.amber][i % 5]}`}
						>{client}</span
					>
				</li>
			{/each}
		</ul>
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
			<div class="reveal-up mt-10 inline-block p-4">
				<a
					bind:this={magneticBtn}
					href={`mailto:${c.contact.email}`}
					class="display-font inline-block text-2xl font-medium underline decoration-[#5AEDC5] decoration-2 underline-offset-8 will-change-transform hover:decoration-4 md:text-4xl"
				>
					{c.contact.cta}
				</a>
			</div>
			<p class="reveal-up mt-10 text-sm text-[#181C38]/45">{c.contact.address}</p>
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
