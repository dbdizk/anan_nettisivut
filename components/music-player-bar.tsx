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
			className="h-9 w-9 grid place-items-center text-gray-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
		>
			{children}
		</button>
	);
}

export function MusicPlayer() {
	const audioRef = useRef<HTMLAudioElement>(null);
	const pendingPlayRef = useRef(false);

	const playlist = useMemo<Track[]>(() => audioTracks.map((t) => ({ ...t })), []);
	const hasTracks = playlist.length > 0;

	const [index, setIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
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
	}, [isMuted]);

	useEffect(() => {
		const el = audioRef.current;
		if (!el) return;

		el.load();
		if (pendingPlayRef.current) {
			pendingPlayRef.current = false;
			el.play().then(
				() => setIsPlaying(true),
				() => setIsPlaying(false)
			);
		}
	}, [index]);

	const seekTo = (t: number) => {
		const el = audioRef.current;
		if (!el) return;
		el.currentTime = t;
	};

	return (
		<div className="text-white h-14 w-full max-w-[520px] lg:w-[min(520px,40vw)]">
			<div className="relative h-full">
				<div className="h-full px-3 flex items-center justify-between gap-3 pb-4">
					<div className="flex items-center gap-1">
						<IconButton label="Previous" onClick={onPrev} disabled={!hasTracks}>
							<SkipBack className="h-5 w-5" />
						</IconButton>
						<IconButton label={isPlaying ? "Pause" : "Play"} onClick={togglePlay} disabled={!hasTracks}>
							{isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
						</IconButton>
						<IconButton label="Next" onClick={onNext} disabled={!hasTracks}>
							<SkipForward className="h-5 w-5" />
						</IconButton>
					</div>

					<div className="flex-1 min-w-0 text-center leading-tight">
						<div className="text-sm font-semibold truncate">{currentTrack.title}</div>
						<div className="text-xs text-gray-400 truncate">{currentTrack.artist}</div>
					</div>

					<div className="flex items-center">
						<IconButton label={isMuted ? "Unmute" : "Mute"} pressed={isMuted} onClick={toggleMute}>
							{isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
						</IconButton>
					</div>
				</div>

				<div className="absolute bottom-0 left-0 right-0 px-3 pb-0">
					<div className="flex items-center gap-2 text-[11px] text-gray-400">
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
