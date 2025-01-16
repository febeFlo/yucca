import React, { useEffect, useRef } from 'react';
import { useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { useCharacterAnimations } from '../contexts/CharacterAnimations';

const TRANSITION_DURATION = 0.5;
const ENTRANCE_AUDIO = '/audio/entrance.mp3';

const YuccaEntrance = (props) => {
  const group = useRef();
  const { scene, animations } = useGLTF('/models/YuccaEntrance.glb');
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  const activeActionRef = useRef(null);
  const { scheduleNextAnimation, setIsSpeaking, setAnimationIndex } = useCharacterAnimations();
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    const playEntranceSequence = async () => {
      if (hasPlayedRef.current) return;
      hasPlayedRef.current = true;

      const availableActions = Object.values(actions);
      if (availableActions.length > 0) {
        const action = availableActions[0];
        
        if (action) {
          const duration = action.getClip().duration;
          console.log('YuccaEntrance animation duration:', duration * 1000, 'ms');

          scheduleNextAnimation(duration * 1000);

          // Stop current animation with fadeout
          if (activeActionRef.current && activeActionRef.current !== action) {
            activeActionRef.current.fadeOut(TRANSITION_DURATION);
          }

          // Setup and play entrance animation
          action.reset()
               .setLoop(false)
               .setEffectiveTimeScale(1)
               .fadeIn(TRANSITION_DURATION)
               .play();

          activeActionRef.current = action;

          // Play entrance audio
          try {
            setIsSpeaking(true);
            const audio = new Audio(ENTRANCE_AUDIO);
            await audio.play();
            
            // Transition to idle after both animation and audio complete
            const totalDuration = Math.max(duration * 1000, audio.duration * 1000);
            
            setTimeout(() => {
              setIsSpeaking(false);
              setAnimationIndex(3); // Switch to idle animation
              scheduleNextAnimation(duration * 1000);
            }, totalDuration);
            
          } catch (error) {
            console.error('Failed to play entrance audio:', error);
            setIsSpeaking(false);
            
            // Still transition to idle after animation if audio fails
            setTimeout(() => {
              setAnimationIndex(3);
              scheduleNextAnimation(duration * 1000);
            }, duration * 1000);
          }
        }
      }
    };

    playEntranceSequence();

    return () => {
      if (activeActionRef.current) {
        activeActionRef.current.fadeOut(TRANSITION_DURATION);
        activeActionRef.current.stop();
      }
    };
  }, [actions, scheduleNextAnimation, setAnimationIndex, setIsSpeaking]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="metarig001">
          <primitive object={nodes.spine} />
          <skinnedMesh 
            name="body" 
            geometry={nodes.body.geometry} 
            material={materials.skin} 
            skeleton={nodes.body.skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh 
            name="horn" 
            geometry={nodes.horn.geometry} 
            material={materials.skin} 
            skeleton={nodes.horn.skeleton}
            castShadow
            receiveShadow
          />
          <skinnedMesh 
            name="tail" 
            geometry={nodes.tail.geometry} 
            material={materials.skin} 
            skeleton={nodes.tail.skeleton}
            castShadow
            receiveShadow
          />
        </group>
        <group name="rig001">
          <primitive object={nodes.root} />
          <primitive object={nodes['MCH-torsoparent']} />
          <primitive object={nodes['MCH-hand_ikparentL']} />
          <primitive object={nodes['MCH-upper_arm_ik_targetparentL']} />
          <primitive object={nodes['MCH-hand_ikparentR']} />
          <primitive object={nodes['MCH-upper_arm_ik_targetparentR']} />
        </group>
      </group>
    </group>
  );
};

export default YuccaEntrance;

useGLTF.preload('/models/YuccaEntrance.glb');