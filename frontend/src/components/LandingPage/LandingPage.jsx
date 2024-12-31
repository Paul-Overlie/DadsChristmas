import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { MdGroups, MdEventAvailable, MdOutlineGroupAdd } from "react-icons/md";


const LandingPage = () => {
    const user = useSelector(state => state.session.user)
    console.log(user)
    return <>
    <div className="LandingFirst">
        <div className="LandingFirstLeft">
            <div className="LandingFirstLeftTitle">
                Time to hangout with the Looniest of Tunes where rabbit season is debatable
            </div>
            <div className="LandingFirstLeftText">
                So many friends so little time to schedule them. Let us help! Here you will be able to find all of the exciting characers that have come from the 1930s to today! Just step- step- I said step on up now ya hear? and join this fantastic crowd of characters.
            </div>
        </div>
        <img className="LandingFirstRight" src="https://i.pinimg.com/736x/07/d9/d6/07d9d6acf5eeb6a1019de2b523577522.jpg" />
    </div>
    <div className="LandingSecond">
        <div className="LandingSecondSubtitle">How Loony-up Works</div>
        <div className="LandingSecondCaption">caption? (Will exist eventually unless Marvin takes over first)</div>
    </div>
    <div className="LandingThird">
        <div className="LandingThird1">
            <MdGroups className="LandingThirdIcon"/>
            <Link className="LandingThirdLink" to={"/groups"}>See all groups</Link>
            <div>How many times have you wanted to see all groups available? Here is your chance!</div>
        </div>
        <div className="LandingThird2">
            <MdEventAvailable className="LandingThirdIcon"/>
            <Link className="LandingThirdLink" to={"/events"}>Find an event</Link>
            <div>I tot I taw a specific event</div>
        </div>
        <div className="LandingThird3">
            <MdOutlineGroupAdd className="LandingThirdIcon"/>
            {user?<Link className="LandingThirdLink" to={"/groups/create"}>Start a group</Link>:<div className="LandingThird3DisabledLink">Start a group</div>}
            <div>Thith buthon is thpecifically to thart a new group</div>
        </div>
    </div>
    <div className="LandingFourth">
        { !user?.firstName ? <button>Join Loony-up</button> : null }
    </div>
    </>
}

export default LandingPage