import React, { useEffect, useRef } from 'react';
import { useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { useCharacterAnimations } from '../contexts/CharacterAnimations';

const TRANSITION_DURATION = 0.5;

const YuccaMikir2 = (props) => {
  const group = useRef();
  const { scene, animations } = useGLTF('/models/YuccaMikir2.glb');
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);
  const { actions } = useAnimations(animations, group);
  const activeActionRef = useRef(null);
  const { isProcessing } = useCharacterAnimations();

  useEffect(() => {
    const availableActions = Object.values(actions);
    if (availableActions.length > 0 && isProcessing) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      const action = availableActions[randomIndex];
      
      if (action) {
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
        activeActionRef.current.stop();
      }
    };
  }, [actions, isProcessing]);

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
        <group name="WGT-rig001_spine_fk" />
        <group name="WGT-rig001_spine_fk001" />
        <group name="WGT-rig001_spine_fk002" />
        <group name="WGT-rig001_spine_fk003" />
        <group name="WGT-rig001_torso" />
        <group name="WGT-rig001_hips" />
        <group name="WGT-rig001_chest" />
        <group name="WGT-rig001_upper_arm_fkL" />
        <group name="WGT-rig001_forearm_fkL" />
        <group name="WGT-rig001_hand_fkL" />
        <group name="WGT-rig001_upper_arm_fkR" />
        <group name="WGT-rig001_forearm_fkR" />
        <group name="WGT-rig001_hand_fkR" />
        <group name="WGT-rig001_root" />
      </group>
    </group>
  );
};

export default YuccaMikir2;

useGLTF.preload('/models/YuccaMikir2.glb');