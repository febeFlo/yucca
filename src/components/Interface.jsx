import { Affix, Button, Stack, MantineProvider } from "@mantine/core"
import { useCharacterAnimations } from "../contexts/CharacterAnimations"

const Interface = () => {
    const { animations, animationIndex, setAnimationIndex } = useCharacterAnimations()
    const filteredAnimations = [1, 4, 5].map(index => ({ animation: animations[index], index }))
    
    return (
        <MantineProvider>
        <Affix 
            position={{ bottom: 25, left: 20 }}>
            <Stack>
                {filteredAnimations.map(({animation, index}) => (
                    <Button 
                        key={`${animation}-${index}`}
                        variant={index === animationIndex ? "filled" : "light"}
                        onClick={() => setAnimationIndex(index)}
                    >
                        {animation}
                    </Button>
                ))}
            </Stack>
        </Affix>
        </MantineProvider>
    )
}

export default Interface
