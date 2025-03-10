/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.3 public/models/YuccaTungguSebentar_ver2.glb 
*/

import React, { useEffect, useRef } from 'react';
import { useGraph } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { useCharacterAnimations } from '../contexts/CharacterAnimations';
import * as THREE from 'three';


const TRANSITION_DURATION = 0.5;

const YuccaTungguSebentar_ver2 = (props) => {
  const group = React.useRef()
  const { scene, animations } = useGLTF('/models/YuccaTungguSebentar_ver2.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone)
  const { setAnimations, animationIndex } = useCharacterAnimations();
  const { actions, names } = useAnimations(animations, group)
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
          .setLoop(THREE.LoopPingPong, Infinity)
          .setEffectiveTimeScale(0.7)
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
          <skinnedMesh name="body" geometry={nodes.body.geometry} material={materials.skin} skeleton={nodes.body.skeleton} castShadow
            receiveShadow />
          <skinnedMesh name="horn" geometry={nodes.horn.geometry} material={materials.skin} skeleton={nodes.horn.skeleton} castShadow
            receiveShadow />
          <skinnedMesh name="tail" geometry={nodes.tail.geometry} material={materials.skin} skeleton={nodes.tail.skeleton} castShadow
            receiveShadow />
        </group>
        <group name="rig001">
          <primitive object={nodes.root} />
          <primitive object={nodes['MCH-torsoparent']} />
          <primitive object={nodes['MCH-hand_ikparentL']} />
          <primitive object={nodes['MCH-upper_arm_ik_targetparentL']} />
          <primitive object={nodes['MCH-hand_ikparentR']} />
          <primitive object={nodes['MCH-upper_arm_ik_targetparentR']} />
        </group>
        <group name="WGT-rig001_spine_fk" position={[0.001, 0.393, 0.016]} rotation={[1.823, 0, 0]} scale={0.157} />
        <group name="WGT-rig001_spine_fk001" position={[0, 0.536, 0]} rotation={[1.455, 0.004, 0]} scale={0.144} />
        <group name="WGT-rig001_spine_fk002" position={[0, 0.536, 0]} rotation={[1.555, 0.015, 0]} scale={0.142} />
        <group name="WGT-rig001_spine_fk003" position={[-0.002, 0.678, -0.002]} rotation={[1.568, 0.01, 0]} scale={0.89} />
        <group name="WGT-rig001_tweak_spine" position={[0.001, 0.24, -0.023]} rotation={[1.823, 0, 0]} scale={0.079} />
        <group name="WGT-rig001_tweak_spine001" position={[0.001, 0.393, 0.016]} rotation={[1.455, 0.004, 0]} scale={0.072} />
        <group name="WGT-rig001_tweak_spine002" position={[0, 0.536, 0]} rotation={[1.555, 0.015, 0]} scale={0.071} />
        <group name="WGT-rig001_tweak_spine003" position={[-0.002, 0.678, -0.002]} rotation={[1.568, 0.01, 0]} scale={0.445} />
        <group name="WGT-rig001_tweak_spine004" position={[-0.011, 1.568, -0.005]} rotation={[1.568, 0.01, 0]} scale={0.445} />
        <group name="WGT-rig001_torso" position={[0.001, 0.317, -0.003]} scale={0.8} />
        <group name="WGT-rig001_hips" position={[0.001, 0.24, -0.023]} rotation={[1.823, 0, 0]} scale={0.333} />
        <group name="WGT-rig001_chest" position={[-0.002, 0.678, -0.002]} rotation={[1.568, 0.01, 0]} scale={0.445} />
        <group name="WGT-rig001_breastL" position={[0.049, 0.605, -0.02]} rotation={[Math.PI, 0, Math.PI]} scale={0.058} />
        <group name="WGT-rig001_breastR" position={[-0.049, 0.605, -0.02]} rotation={[0, 0, Math.PI]} scale={-0.058} />
        <group name="WGT-rig001_shoulderL" position={[0.049, 0.636, 0.028]} rotation={[0.009, -1.031, 0.008]} scale={0.188} />
        <group name="WGT-rig001_upper_arm_parentL" position={[0.246, 0.623, -0.011]} rotation={[-1.167, -1.201, -2.833]} scale={0.045} />
        <group name="WGT-rig001_upper_arm_fkL" position={[0.246, 0.623, -0.011]} rotation={[-1.167, -1.201, -2.833]} scale={0.18} />
        <group name="WGT-rig001_forearm_fkL" position={[0.414, 0.564, -0.037]} rotation={[-1.693, -1.213, 2.958]} scale={0.198} />
        <group name="WGT-rig001_hand_fkL" position={[0.6, 0.495, -0.028]} rotation={[-1.797, -1.182, 2.86]} scale={0.077} />
        <group name="WGT-rig001_upper_arm_ikL" position={[0.246, 0.623, -0.011]} rotation={[-1.167, -1.201, -2.833]} scale={0.18} />
        <group name="WGT-rig001_upper_arm_ik_targetL" position={[0.407, 0.594, -0.413]} rotation={[-3.061, -0.019, -0.457]} scale={0.047} />
        <group name="WGT-rig001_hand_ikL" position={[0.6, 0.495, -0.028]} rotation={[-1.797, -1.182, 2.86]} scale={0.077} />
        <group name="WGT-rig001_VIS_upper_arm_ik_poleL" position={[0.414, 0.564, -0.037]} rotation={[Math.PI / 2, 0, -1.996]} scale={0.377} />
        <group name="WGT-rig001_upper_arm_tweakL" position={[0.246, 0.623, -0.011]} rotation={[-1.167, -1.201, -2.833]} scale={0.045} />
        <group name="WGT-rig001_upper_arm_tweakL001" position={[0.33, 0.594, -0.024]} rotation={[-1.167, -1.201, -2.833]} scale={0.045} />
        <group name="WGT-rig001_forearm_tweakL" position={[0.414, 0.564, -0.037]} rotation={[-1.693, -1.213, 2.958]} scale={0.05} />
        <group name="WGT-rig001_forearm_tweakL001" position={[0.507, 0.529, -0.032]} rotation={[-1.693, -1.213, 2.958]} scale={0.05} />
        <group name="WGT-rig001_hand_tweakL" position={[0.6, 0.495, -0.028]} rotation={[-1.797, -1.182, 2.86]} scale={0.019} />
        <group name="WGT-rig001_shoulderR" position={[-0.049, 0.636, 0.028]} rotation={[-3.132, -1.031, 0.008]} scale={-0.188} />
        <group name="WGT-rig001_upper_arm_parentR" position={[-0.246, 0.623, -0.011]} rotation={[1.974, -1.201, -2.833]} scale={-0.045} />
        <group name="WGT-rig001_upper_arm_fkR" position={[-0.246, 0.623, -0.011]} rotation={[1.975, -1.201, -2.833]} scale={-0.18} />
        <group name="WGT-rig001_forearm_fkR" position={[-0.414, 0.564, -0.037]} rotation={[1.449, -1.213, 2.958]} scale={-0.198} />
        <group name="WGT-rig001_hand_fkR" position={[-0.6, 0.495, -0.028]} rotation={[1.344, -1.182, 2.86]} scale={-0.077} />
        <group name="WGT-rig001_upper_arm_ikR" position={[-0.246, 0.623, -0.011]} rotation={[1.975, -1.201, -2.833]} scale={-0.18} />
        <group name="WGT-rig001_upper_arm_ik_targetR" position={[-0.407, 0.594, -0.413]} rotation={[0.081, -0.019, -0.457]} scale={-0.047} />
        <group name="WGT-rig001_hand_ikR" position={[-0.6, 0.495, -0.028]} rotation={[1.344, -1.182, 2.86]} scale={-0.077} />
        <group name="WGT-rig001_VIS_upper_arm_ik_poleR" position={[-0.414, 0.564, -0.037]} rotation={[-Math.PI / 2, 0, -1.996]} scale={-0.377} />
        <group name="WGT-rig001_upper_arm_tweakR" position={[-0.246, 0.623, -0.011]} rotation={[1.975, -1.201, -2.833]} scale={-0.045} />
        <group name="WGT-rig001_upper_arm_tweakR001" position={[-0.33, 0.594, -0.024]} rotation={[1.975, -1.201, -2.833]} scale={-0.045} />
        <group name="WGT-rig001_forearm_tweakR" position={[-0.414, 0.564, -0.037]} rotation={[1.449, -1.213, 2.958]} scale={-0.05} />
        <group name="WGT-rig001_forearm_tweakR001" position={[-0.507, 0.529, -0.032]} rotation={[1.449, -1.213, 2.958]} scale={-0.05} />
        <group name="WGT-rig001_hand_tweakR" position={[-0.6, 0.495, -0.028]} rotation={[1.344, -1.182, 2.86]} scale={-0.019} />
        <group name="WGT-rig001_root" scale={1.637} />
      </group>
    </group>
  )
}

export default YuccaTungguSebentar_ver2

useGLTF.preload('/models/YuccaTungguSebentar_ver2.glb')
