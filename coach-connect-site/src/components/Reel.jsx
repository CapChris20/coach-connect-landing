// Reel.jsx — the pinned scroll reel (DESIGN.md C1 + B2), the cinematic part.
// Flow: the section is (scenes x 120vh) tall; a 100svh stage sticks to the top
// while you scroll through it → scroll progress picks the scene → the phone swaps
// to that scene's real app recording, the caption re-keys, a stepped wipe covers
// the change, and the wireframe behind moves with the scroll.
// Chrome (all small): HUD top-left, ticks on the right, 4px bar along the bottom,
// corner brackets. Tapping a tick scrolls to that scene.
import { useEffect, useRef, useState } from 'react';
import { LazyMount } from '../backgrounds/plumbing';
import { Wireframe } from '../backgrounds/Wireframe';
import { Phone } from './Phone';

// Manipulate here: scroll distance per scene, in viewport heights.
const VIEWPORTS_PER_SCENE = 1.2;

/**
 * @param {{ scenes: Array<{ id: string, title: string, text: string, src: string }>, label: string, id?: string }} props
 * @returns {JSX.Element}
 */
export function Reel({ scenes, label, id }) {
  const sectionRef = useRef(null);
  const barRef = useRef(null);
  const travelRef = useRef(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = scenes[sceneIndex];

  // 1. Scroll → progress (ref, no re-render) → scene index (state, only on change).
  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const box = sectionRef.current.getBoundingClientRect();
      const progress = Math.min(0.9999, Math.max(0, -box.top / (box.height - window.innerHeight)));
      travelRef.current = progress * 60;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      setSceneIndex(Math.floor(progress * scenes.length));
    };
    const onScroll = () => {
      if (!frameId) frameId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frameId);
    };
  }, [scenes.length]);

  // 2. Ticks jump to the middle of their scene.
  const jumpToScene = (targetIndex) => {
    const section = sectionRef.current;
    const scrollable = section.offsetHeight - window.innerHeight;
    const top = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + scrollable * ((targetIndex + 0.5) / scenes.length), behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      className="reel"
      style={{ height: `${scenes.length * VIEWPORTS_PER_SCENE * 100}vh` }}
      aria-label={label}
    >
      <div className="reel-stage">
        <LazyMount>
          <Wireframe timeRef={travelRef} />
        </LazyMount>
        <div className="reel-scrim" aria-hidden="true" />

        <span className="bracket bracket-tl" aria-hidden="true" />
        <span className="bracket bracket-tr" aria-hidden="true" />
        <span className="bracket bracket-bl" aria-hidden="true" />
        <span className="bracket bracket-br" aria-hidden="true" />

        <ul className="reel-hud mono" aria-hidden="true">
          <li>{label}</li>
          <li>
            Scene {String(sceneIndex + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
          </li>
          <li>Real app recording</li>
        </ul>

        <div className="reel-phone">
          <Phone clip={scene} loop />
        </div>

        <div key={scene.id} className="reel-caption" aria-live="polite">
          <h3 className="t-reel reel-title">{scene.title}</h3>
          <p className="lead reel-text">{scene.text}</p>
        </div>

        <ol className="reel-ticks" aria-label="Scenes">
          {scenes.map((tickScene, tickIndex) => (
            <li key={tickScene.id}>
              <button
                type="button"
                className="reel-tick"
                aria-current={tickIndex === sceneIndex ? 'step' : undefined}
                aria-label={`Scene ${tickIndex + 1}: ${tickScene.title}`}
                onClick={() => jumpToScene(tickIndex)}
              >
                <span />
              </button>
            </li>
          ))}
        </ol>

        <div className="reel-bar" aria-hidden="true">
          <span ref={barRef} />
        </div>
        <div key={`wipe-${sceneIndex}`} className="wipe" aria-hidden="true" />
      </div>
    </section>
  );
}
