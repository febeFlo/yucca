import React, { useEffect, useRef } from 'react';
import { useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { useCharacterAnimations } from '../contexts/CharacterAnimations';

const TRANSITION_DURATION = 0.0;

const YuccaNgomong = (props) => {
  const group = useRef();
  const { scene, animations } = useGLTF('/models/YuccaNgomong.glb');
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  const activeActionRef = useRef(null);
  const { scheduleNextAnimation } = useCharacterAnimations();

  useEffect(() => {
    const availableActions = Object.values(actions);
    if (availableActions.length > 0) {
      const action = availableActions[0];
      
      if (action) {
        const duration = action.getClip().duration;
        console.log('Ngomong animation duration:', duration * 1000, 'ms');
        
        scheduleNextAnimation(duration * 1000);

        if (activeActionRef.current && activeActionRef.current !== action) {
          activeActionRef.current.fadeOut(TRANSITION_DURATION);
        }

        action.reset()
             .setLoop(true)
             .setEffectiveTimeScale(1)
             .fadeIn(TRANSITION_DURATION)
             .play();

        activeActionRef.current = action;
      }
    }

    return () => {
      if (activeActionRef.current) {
        activeActionRef.current.fadeOut(TRANSITION_DURATION);
      }
    };
  }, [actions, scheduleNextAnimation]);

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
      </group>
    </group>
  );
};

export default YuccaNgomong;
useGLTF.preload('/models/YuccaNgomong.glb');