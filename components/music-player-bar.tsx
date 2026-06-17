"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { audioTracks } from "@/data/audio-tracks.generated";

type Track = {
	title: string;
	artist: string;
	src: string;
};

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const whole = Math.floor(seconds);
	const m = Math.floor(whole / 60);
	const s = whole % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

function IconButton({
	label,
	pressed,
	disabled,
	onClick,
	children,
}: {
	label: string;
	pressed?: boolean;
	disabled?: boolean;
	onClick?: () => void;
	children: ReactNode;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			aria-pressed={pressed}
			disabled={disabled}
			onClick={onClick}
			className="h-[2.25em] w-[2.25em] grid place-items-center text-gray-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
		>
			{children}
		</button>
	);
}

export function MusicPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const pendingPlayRef = useRef(false);
	const audioContextRef = useRef<AudioContext | null>(null);
	const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
	const compressorRef = useRef<DynamicsCompressorNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);
	const DEFAULT_VOLUME = 0.58;
	const volumeRef = useRef(DEFAULT_VOLUME);

	const ensureAudioGraph = () => {
		const el = audioRef.current;
		if (!el) return;

		const AudioCtx = globalThis.AudioContext ?? (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioCtx) return;

		if (!audioContextRef.current) {
			audioContextRef.current = new AudioCtx();
		}

		const ctx = audioContextRef.current;
		if (!ctx) return;

		if (!sourceNodeRef.current) {
			sourceNodeRef.current = ctx.createMediaElementSource(el);
			compressorRef.current = ctx.createDynamicsCompressor();
			gainNodeRef.current = ctx.createGain();

			compressorRef.current.threshold.value = -26;
			compressorRef.current.knee.value = 24;
			compressorRef.current.ratio.value = 12;
			compressorRef.current.attack.value = 0.003;
			compressorRef.current.release.value = 0.2;
			gainNodeRef.current.gain.value = volumeRef.current;

			sourceNodeRef.current.connect(compressorRef.current);
			compressorRef.current.connect(gainNodeRef.current);
			gainNodeRef.current.connect(ctx.destination);
		}
	};

	const playlist = useMemo<Track[]>(() => audioTracks.map((t) => ({ ...t })), []);
	const hasTracks = playlist.length > 0;

	const [index, setIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState(DEFAULT_VOLUME);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	const currentTrack = hasTracks
		? playlist[index] ?? playlist[0]!
		: {
			title: "No tracks found",
			artist: "Add files to public/audio",
			src: "",
		};

	const loadAndMaybePlay = (nextIndex: number, shouldPlay = isPlaying) => {
		setIndex(nextIndex);
		pendingPlayRef.current = shouldPlay;

		const el = audioRef.current;
		if (el) {
			el.pause();
			setIsPlaying(false);
		}
	};

	const nextIndexLinear = (from: number) => (hasTracks ? (from + 1) % playlist.length : 0);
	const prevIndexLinear = (from: number) => (hasTracks ? (from - 1 + playlist.length) % playlist.length : 0);

	const onPrev = () => {
		if (!hasTracks) return;
		const el = audioRef.current;
		if (el && el.currentTime > 3) {
			el.currentTime = 0;
			return;
		}
		loadAndMaybePlay(prevIndexLinear(index));
	};

	const onNext = () => {
		if (!hasTracks) return;
		loadAndMaybePlay(nextIndexLinear(index));
	};

	const togglePlay = () => {
		if (!hasTracks) return;
		const el = audioRef.current;
		if (!el) return;
		ensureAudioGraph();
		void audioContextRef.current?.resume();

		if (isPlaying) {
			el.pause();
			setIsPlaying(false);
			return;
		}

		el.play().then(
			() => setIsPlaying(true),
			() => setIsPlaying(false)
		);
	};

	const toggleMute = () => {
		const el = audioRef.current;
		if (!el) return;
		const next = !isMuted;
		el.muted = next;
		setIsMuted(next);
	};

	useEffect(() => {
		const el = audioRef.current;
		if (!el) return;

		const onTime = () => setCurrentTime(el.currentTime || 0);
		const onLoaded = () => setDuration(el.duration || 0);
		const onPlay = () => setIsPlaying(true);
		const onPause = () => setIsPlaying(false);
		const onEnded = () => {
			loadAndMaybePlay(nextIndexLinear(index), true);
		};

		el.addEventListener("timeupdate", onTime);
		el.addEventListener("loadedmetadata", onLoaded);
		el.addEventListener("durationchange", onLoaded);
		el.addEventListener("play", onPlay);
		el.addEventListener("pause", onPause);
		el.addEventListener("ended", onEnded);

		return () => {
			el.removeEventListener("timeupdate", onTime);
			el.removeEventListener("loadedmetadata", onLoaded);
			el.removeEventListener("durationchange", onLoaded);
			el.removeEventListener("play", onPlay);
			el.removeEventListener("pause", onPause);
			el.removeEventListener("ended", onEnded);
		};
	}, [index, playlist.length]);

	useEffect(() => {
		const el = audioRef.current;
		if (!el) return;
		el.muted = isMuted;
		el.volume = 1;
		volumeRef.current = volume;
		if (gainNodeRef.current) {
			// Volume rides through the Web Audio gain stage; mute is handled by el.muted.
			gainNodeRef.current.gain.value = volume;
		}
	}, [isMuted, volume]);

	useEffect(() => {
		const el = audioRef.current;
		if (!el) return;

		el.load();
		if (pendingPlayRef.current) {
			pendingPlayRef.current = false;
			ensureAudioGraph();
			void audioContextRef.current?.resume();
			el.play().then(
				() => setIsPlaying(true),
				() => setIsPlaying(false)
			);
		}
	}, [index]);

	useEffect(() => {
		const stop = () => {
			pendingPlayRef.current = false;
			const el = audioRef.current;
			if (el) el.pause();
			setIsPlaying(false);
		};
		window.addEventListener("reel-modal-open", stop);
		return () => window.removeEventListener("reel-modal-open", stop);
	}, []);

	const seekTo = (t: number) => {
		const el = audioRef.current;
		if (!el) return;
		el.currentTime = t;
	};

	return (
		<div className="text-white [font-size:max(1rem,calc(0.5rem+0.74vh))] h-[3.5em] w-full max-w-[32.5em] mx-auto lg:mx-0 lg:w-[min(32.5em,40vw)]">
			<div className="relative h-full">
				<div className="h-full px-[0.75em] flex items-center justify-between gap-[0.75em] pb-[1em]">
					<div className="flex items-center gap-[0.25em]">
						<IconButton label="Previous" onClick={onPrev} disabled={!hasTracks}>
							<SkipBack className="h-[1.25em] w-[1.25em]" />
						</IconButton>
						<IconButton label={isPlaying ? "Pause" : "Play"} onClick={togglePlay} disabled={!hasTracks}>
							{isPlaying ? <Pause className="h-[1.25em] w-[1.25em]" /> : <Play className="h-[1.25em] w-[1.25em]" />}
						</IconButton>
						<IconButton label="Next" onClick={onNext} disabled={!hasTracks}>
							<SkipForward className="h-[1.25em] w-[1.25em]" />
						</IconButton>
					</div>

					<div className="flex-1 min-w-0 text-center leading-tight">
						<div className="text-[0.875em] font-semibold truncate">{currentTrack.title}</div>
						<div className="text-[0.75em] text-gray-400 truncate">{currentTrack.artist}</div>
					</div>

					<div className="group/vol relative flex items-center">
						<IconButton label={isMuted ? "Unmute" : "Mute"} pressed={isMuted} onClick={toggleMute}>
							{isMuted ? <VolumeX className="h-[1.25em] w-[1.25em]" /> : <Volume2 className="h-[1.25em] w-[1.25em]" />}
						</IconButton>
						<div className="pointer-events-none absolute right-full top-1/2 z-20 hidden -translate-y-1/2 pr-[0.6em] opacity-0 transition-opacity group-hover/vol:pointer-events-auto group-hover/vol:opacity-100 lg:block">
							<input
								aria-label="Volume"
								type="range"
								min={0}
								max={1}
								step={0.01}
								value={isMuted ? 0 : volume}
								onChange={(e) => {
									const v = Number(e.target.value);
									setVolume(v);
									if (isMuted && v > 0) setIsMuted(false);
								}}
								className="h-[0.125em] w-[5em] cursor-pointer accent-white"
							/>
						</div>
					</div>
				</div>

				<div className="absolute bottom-0 left-0 right-0 px-[0.75em] pb-0">
					<div className="flex items-center gap-[0.5em] text-[0.6875em] text-gray-400">
						<span className="tabular-nums w-[40px] text-left">{formatTime(currentTime)}</span>
						<input
							aria-label="Seek"
							type="range"
							min={0}
							max={duration || 0}
							step={0.01}
							value={Math.min(currentTime, duration || 0)}
							onChange={(e) => seekTo(Number(e.target.value))}
							className="w-full h-[2px] accent-gray-200"
						/>
						<span className="tabular-nums w-[40px] text-right">{formatTime(duration)}</span>
					</div>
				</div>
			</div>

			<audio ref={audioRef} src={currentTrack.src || undefined} preload="metadata" muted={isMuted} />
		</div>
	);
}
